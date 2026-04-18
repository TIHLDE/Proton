import ical, { ICalCalendarMethod } from "ical-generator";
import { env } from "~/env";
import { getEventTypeLabel } from "~/lib/event-presentation";
import { db } from "~/server/db";

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ token: string }> },
) {
	const { token } = await params;

	const user = await db.user.findUnique({
		where: { calendarToken: token },
		select: { id: true, name: true },
	});

	if (!user) {
		return new Response("Not found", { status: 404 });
	}

	const memberships = await db.teamMember.findMany({
		where: { userId: user.id },
		select: {
			team: {
				select: {
					id: true,
					name: true,
					events: {
						select: {
							id: true,
							name: true,
							eventType: true,
							startAt: true,
							endAt: true,
							location: true,
							note: true,
							registrations: {
								where: { userId: user.id },
								select: { type: true },
							},
						},
					},
				},
			},
		},
	});

	const baseUrl = env.NEXT_PUBLIC_URL ?? "https://sporty.tihlde.org";

	const calendar = ical({
		name: `TIHLDE Idrett – ${user.name}`,
		timezone: "Europe/Oslo",
		prodId: { company: "TIHLDE", product: "Sporty", language: "NO" },
		method: ICalCalendarMethod.PUBLISH,
	});
	calendar.x("X-PUBLISHED-TTL", "PT15M");

	for (const membership of memberships) {
		const { team } = membership;

		for (const event of team.events) {
			const myRegistration = event.registrations[0];

			if (myRegistration?.type === "NOT_ATTENDING") {
				continue;
			}

			const typeLabel = getEventTypeLabel(event.eventType);
			const start = event.startAt;
			const end = event.endAt ?? new Date(start.getTime() + 60 * 60 * 1000);

			const descriptionParts: string[] = [];
			if (event.note) descriptionParts.push(event.note);
			descriptionParts.push(`Registrer oppmøte her: ${baseUrl}`);

			calendar.createEvent({
				id: `${event.id}@sporty.tihlde.org`,
				summary: `${typeLabel}: ${event.name} – ${team.name}`,
				start,
				end,
				location: event.location ?? undefined,
				description: descriptionParts.join("\n\n"),
				url: baseUrl,
			});
		}
	}

	return new Response(calendar.toString(), {
		status: 200,
		headers: {
			"Content-Type": "text/calendar; charset=utf-8",
			"Content-Disposition": 'attachment; filename="tihlde-sporty.ics"',
			"Cache-Control": "no-cache, no-store, must-revalidate",
			Pragma: "no-cache",
			Expires: "0",
		},
	});
}
