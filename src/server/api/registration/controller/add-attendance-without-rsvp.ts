import type { User } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import type z from "zod";
import { addAttendanceWithoutRsvpSchema } from "~/schemas/registration";
import { db } from "~/server/db";
import { type Controller, authorizedProcedure } from "../../trpc";
import { hasTeamAccessMiddleware } from "../../util/auth";

const handler: Controller<
	z.infer<typeof addAttendanceWithoutRsvpSchema>,
	void
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

	const membership = await db.teamMember.findUnique({
		where: {
			userId_teamId: { userId: input.userId, teamId: event.teamId },
		},
	});

	if (!membership) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: "Brukeren er ikke medlem av laget",
		});
	}

	await db.attendance.upsert({
		where: { userId_eventId: { userId: input.userId, eventId: input.eventId } },
		create: {
			userId: input.userId,
			eventId: input.eventId,
			status: "PRESENT",
			source: "MANUAL",
		},
		update: { status: "PRESENT", source: "MANUAL" },
	});
};

export default authorizedProcedure
	.input(addAttendanceWithoutRsvpSchema)
	.mutation(handler);
