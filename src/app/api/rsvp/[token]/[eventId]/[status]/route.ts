import type { RegistrationType } from "@prisma/client";
import { NextResponse } from "next/server";
import { env } from "~/env";
import { db } from "~/server/db";

const VALID_STATUSES: RegistrationType[] = ["ATTENDING", "NOT_ATTENDING"];

export async function GET(
	_request: Request,
	{
		params,
	}: { params: Promise<{ token: string; eventId: string; status: string }> },
) {
	const { token, eventId, status } = await params;

	const baseUrl = env.NEXT_PUBLIC_URL ?? "https://sporty.tihlde.org";

	if (!VALID_STATUSES.includes(status as RegistrationType)) {
		return new Response("Invalid status", { status: 400 });
	}

	const [user, event] = await Promise.all([
		db.user.findUnique({
			where: { calendarToken: token },
			select: { id: true },
		}),
		db.teamEvent.findUnique({
			where: { id: eventId },
			select: { teamId: true, name: true },
		}),
	]);

	if (!user) {
		return new Response("Not found", { status: 404 });
	}

	if (!event) {
		return new Response("Event not found", { status: 404 });
	}

	const membership = await db.teamMember.findUnique({
		where: { userId_teamId: { userId: user.id, teamId: event.teamId } },
		select: { id: true },
	});

	if (!membership) {
		return new Response("Not a team member", { status: 403 });
	}

	await db.registration.upsert({
		where: { userId_eventId: { userId: user.id, eventId } },
		update: { type: status as RegistrationType },
		create: { userId: user.id, eventId, type: status as RegistrationType },
	});

	return NextResponse.redirect(
		`${baseUrl}/rsvp/bekreftet?rsvp=${status}&event=${encodeURIComponent(event.name)}`,
	);
}
