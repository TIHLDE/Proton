import type { User } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import type z from "zod";
import { getRegistrationByEventSchema } from "~/schemas";
import { db } from "~/server/db";
import { type Controller, authorizedProcedure } from "../../trpc";
import { hasTeamAccessMiddleware } from "../../util/auth";

const handler: Controller<
	z.infer<typeof getRegistrationByEventSchema>,
	any
> = async ({ input, ctx }) => {
	const event = await db.teamEvent.findUnique({
		where: { id: input.eventId },
		select: { teamId: true },
	});

	if (!event) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: "Arrangement ikke funnet",
		});
	}

	await hasTeamAccessMiddleware(ctx.user as User, event.teamId, [
		"ADMIN",
		"SUBADMIN",
		"USER",
	]);

	const [registrations, attendances, teamMembers] = await Promise.all([
		db.registration.findMany({
			where: { eventId: input.eventId },
			include: {
				user: { select: { id: true, name: true, image: true } },
			},
			orderBy: { createdAt: "asc" },
		}),
		db.attendance.findMany({
			where: { eventId: input.eventId },
			include: {
				user: { select: { id: true, name: true, image: true } },
			},
		}),
		db.teamMember.findMany({
			where: { teamId: event.teamId },
			include: {
				user: { select: { id: true, name: true, image: true } },
			},
		}),
	]);

	const absentUserIds = new Set(
		attendances.filter((a) => a.status === "ABSENT").map((a) => a.userId),
	);
	const attendingUserIds = new Set(
		registrations.filter((r) => r.type === "ATTENDING").map((r) => r.userId),
	);
	const registeredUserIds = new Set(registrations.map((r) => r.userId));
	const manualAttendanceUserIds = new Set(
		attendances.filter((a) => a.source === "MANUAL").map((a) => a.userId),
	);

	const now = new Date();

	return [
		...registrations.map((reg) => ({
			...reg,
			confirmedAbsent: absentUserIds.has(reg.userId),
			attendedWithoutRsvp: false,
			absenceReason:
				reg.type === "NOT_ATTENDING"
					? ("not_attending" as const)
					: absentUserIds.has(reg.userId)
						? ("overridden" as const)
						: null,
		})),
		...attendances
			.filter((a) => a.source === "MANUAL" && !attendingUserIds.has(a.userId))
			.map((a) => ({
				id: a.id,
				type: "ATTENDING" as const,
				confirmedAbsent: a.status === "ABSENT",
				attendedWithoutRsvp: true,
				absenceReason: null as null,
				userId: a.userId,
				eventId: a.eventId,
				comment: null,
				user: a.user,
				createdAt: a.createdAt,
				updatedAt: a.updatedAt,
			})),
		...teamMembers
			.filter(
				(m) =>
					!registeredUserIds.has(m.userId) &&
					!manualAttendanceUserIds.has(m.userId),
			)
			.map((m) => ({
				id: m.id,
				type: "NOT_ATTENDING" as const,
				confirmedAbsent: false,
				attendedWithoutRsvp: false,
				absenceReason: "no_response" as const,
				userId: m.userId,
				eventId: input.eventId,
				comment: null,
				user: m.user,
				createdAt: now,
				updatedAt: now,
			})),
	].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
};

export default authorizedProcedure
	.input(getRegistrationByEventSchema)
	.query(handler);
