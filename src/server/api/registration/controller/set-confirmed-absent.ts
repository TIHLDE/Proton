import type { User } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import type z from "zod";
import { setConfirmedAbsentSchema } from "~/schemas/registration";
import { db } from "~/server/db";
import { type Controller, authorizedProcedure } from "../../trpc";
import { hasTeamAccessMiddleware } from "../../util/auth";

const handler: Controller<
	z.infer<typeof setConfirmedAbsentSchema>,
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

	if (input.confirmedAbsent) {
		await db.attendance.upsert({
			where: {
				userId_eventId: { userId: input.userId, eventId: input.eventId },
			},
			create: {
				userId: input.userId,
				eventId: input.eventId,
				status: "ABSENT",
				source: "RSVP",
			},
			update: { status: "ABSENT" },
		});
	} else {
		const existing = await db.attendance.findUnique({
			where: {
				userId_eventId: { userId: input.userId, eventId: input.eventId },
			},
			select: { source: true },
		});
		if (existing?.source === "MANUAL") {
			await db.attendance.update({
				where: {
					userId_eventId: { userId: input.userId, eventId: input.eventId },
				},
				data: { status: "PRESENT" },
			});
		} else {
			await db.attendance.deleteMany({
				where: { userId: input.userId, eventId: input.eventId },
			});
		}
	}
};

export default authorizedProcedure
	.input(setConfirmedAbsentSchema)
	.mutation(handler);
