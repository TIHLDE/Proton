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

	const [registrations, attendances] = await Promise.all([
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
	]);

	const absentUserIds = new Set(
		attendances.filter((a) => a.status === "ABSENT").map((a) => a.userId),
	);
	const attendingUserIds = new Set(
		registrations.filter((r) => r.type === "ATTENDING").map((r) => r.userId),
	);

	return [
		...registrations.map((reg) => ({
			...reg,
			confirmedAbsent: absentUserIds.has(reg.userId),
			attendedWithoutRsvp: false,
		})),
		...attendances
			.filter((a) => a.source === "MANUAL" && !attendingUserIds.has(a.userId))
			.map((a) => ({
				id: a.id,
				type: "ATTENDING" as const,
				confirmedAbsent: a.status === "ABSENT",
				attendedWithoutRsvp: true,
				userId: a.userId,
				eventId: a.eventId,
				comment: null,
				user: a.user,
				createdAt: a.createdAt,
				updatedAt: a.updatedAt,
			})),
	].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
};

export default authorizedProcedure
	.input(getRegistrationByEventSchema)
	.query(handler);
