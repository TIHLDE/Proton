import type { User } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import type z from "zod";
import { adminUpdateRegistrationSchema } from "~/schemas";
import { db } from "~/server/db";
import { type Controller, authorizedProcedure } from "../../trpc";
import { hasTeamAccessMiddleware } from "../../util/auth";

const handler: Controller<
	z.infer<typeof adminUpdateRegistrationSchema>,
	void
> = async ({ input, ctx }) => {
	// Get the event to check team access
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

	// Check if user is admin or subadmin
	await hasTeamAccessMiddleware(ctx.user as User, event.teamId, [
		"ADMIN",
		"SUBADMIN",
	]);

	// Check if the target user is a member of the team
	const targetUserMembership = await db.teamMember.findUnique({
		where: {
			userId_teamId: {
				userId: input.userId,
				teamId: event.teamId,
			},
		},
	});

	if (!targetUserMembership) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: "Brukeren er ikke medlem av laget",
		});
	}

	// Check if registration already exists
	const existing = await db.registration.findUnique({
		where: {
			userId_eventId: {
				userId: input.userId,
				eventId: input.eventId,
			},
		},
	});

	if (existing) {
		// Update existing registration
		await db.registration.update({
			where: { id: existing.id },
			data: {
				type: input.type,
				comment: input.comment,
			},
		});
	} else {
		// Create new registration
		await db.registration.create({
			data: {
				userId: input.userId,
				eventId: input.eventId,
				type: input.type,
				comment: input.comment,
			},
		});
	}
};

export default authorizedProcedure
	.input(adminUpdateRegistrationSchema)
	.mutation(handler);
