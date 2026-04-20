import ical, { ICalCalendarMethod, ICalEventStatus } from "ical-generator";
import { env } from "~/env";
import { getEventTypeLabel } from "~/lib/event-presentation";
import { db } from "~/server/db";

export async function GET(
	request: Request,
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
						orderBy: { startAt: "asc" },
						select: {
							id: true,
							name: true,
							eventType: true,
							startAt: true,
							endAt: true,
							updatedAt: true,
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
	const rsvpTokenBase = `${baseUrl}/api/rsvp/${token}`;

	const calendar = ical({
		name: `TIHLDE Idrett – ${user.name}`,
		prodId: { company: "TIHLDE", product: "Sporty", language: "NO" },
		method: ICalCalendarMethod.PUBLISH,
	});

	for (const membership of memberships) {
		const { team } = membership;

		for (const event of team.events) {
			const registration = event.registrations[0];

			if (registration?.type === "NOT_ATTENDING") continue;

			const typeLabel = getEventTypeLabel(event.eventType);
			const start = event.startAt;
			const end = event.endAt ?? new Date(start.getTime() + 60 * 60 * 1000);
			const eventUrl = `${baseUrl}/lag/${team.id}`;
			const rsvpBase = `${rsvpTokenBase}/${event.id}`;

			const descriptionParts: string[] = [];
			if (event.note) descriptionParts.push(event.note);

			let summary: string;
			if (registration?.type === "ATTENDING") {
				summary = `✅ ${team.name} – ${typeLabel}: ${event.name}`;
				descriptionParts.push(
					`Status: ✅ Du er påmeldt!\n\n❌ Meld deg av her:\n${rsvpBase}/NOT_ATTENDING`,
				);
			} else {
				summary = `❓ ${team.name} – ${typeLabel}: ${event.name}`;
				descriptionParts.push(
					`Status: ❓ Du har ikke svart ennå.\n\n✅ Jeg skal:\n${rsvpBase}/ATTENDING\n\n❌ Jeg skal ikke:\n${rsvpBase}/NOT_ATTENDING`,
				);
			}

			descriptionParts.push(`Se detaljer:\n${eventUrl}`);

			calendar.createEvent({
				id: `${event.id}@sporty.tihlde.org`,
				summary,
				start,
				end,
				stamp: event.updatedAt,
				status: ICalEventStatus.CONFIRMED,
				location: event.location ?? undefined,
				description: descriptionParts.join("\n\n"),
				url: eventUrl,
			});
		}
	}

	const icsOutput = calendar
		.toString()
		.replace(
			"METHOD:PUBLISH",
			"METHOD:PUBLISH\r\nX-PUBLISHED-TTL:PT15M\r\nREFRESH-INTERVAL;VALUE=DURATION:PT15M",
		);

	return new Response(icsOutput, {
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
