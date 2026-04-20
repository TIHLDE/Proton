import type { User } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import type z from "zod";
import { getEligibleWithoutRsvpSchema } from "~/schemas/registration";
import { db } from "~/server/db";
import { type Controller, authorizedProcedure } from "../../trpc";
import { hasTeamAccessMiddleware } from "../../util/auth";

type EligibleUser = { id: string; name: string; image: string | null };

const handler: Controller<
	z.infer<typeof getEligibleWithoutRsvpSchema>,
	EligibleUser[]
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
	]);

	const [attendingUserIds, manualPresentUserIds] = await Promise.all([
		db.registration
			.findMany({
				where: { eventId: input.eventId, type: "ATTENDING" },
				select: { userId: true },
			})
			.then((rows) => new Set(rows.map((r) => r.userId))),
		db.attendance
			.findMany({
				where: { eventId: input.eventId, source: "MANUAL", status: "PRESENT" },
				select: { userId: true },
			})
			.then((rows) => new Set(rows.map((a) => a.userId))),
	]);

	const excluded = new Set([...attendingUserIds, ...manualPresentUserIds]);

	const teamMembers = await db.teamMember.findMany({
		where: {
			teamId: event.teamId,
			userId: { notIn: [...excluded] },
		},
		select: { user: { select: { id: true, name: true, image: true } } },
	});

	return teamMembers.map((m) => m.user);
};

export default authorizedProcedure
	.input(getEligibleWithoutRsvpSchema)
	.query(handler);
