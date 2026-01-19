import type { User } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import type z from "zod";
import { createRegistrationSchema } from "~/schemas";
import { db } from "~/server/db";
import { type Controller, authorizedProcedure } from "../../trpc";
import { hasTeamAccessMiddleware } from "../../util/auth";

const handler: Controller<
	z.infer<typeof createRegistrationSchema>,
	void
> = async ({ input, ctx }) => {
	// Get the event to check team access
	const event = await db.teamEvent.findUnique({
		where: { id: input.eventId },
		select: { teamId: true, registrationDeadline: true },
	});

	if (!event) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: "Arrangement ikke funnet",
		});
	}

	// Check if user has access to the team
	await hasTeamAccessMiddleware(ctx.user as User, event.teamId, [
		"ADMIN",
		"USER",
	]);

	// Check user's role in the team
	const userMembership = await db.teamMember.findUnique({
		where: {
			userId_teamId: {
				userId: ctx.user.id,
				teamId: event.teamId,
			},
		},
		select: {
			role: true,
		},
	});

	const isAdmin =
		userMembership?.role === "ADMIN" || userMembership?.role === "SUBADMIN";

	// Check if registration deadline has passed (allow admin/subadmin to bypass)
	if (
		!isAdmin &&
		event.registrationDeadline &&
		new Date() > event.registrationDeadline
	) {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: "Påmeldingsfristen for dette arrangementet har passert",
		});
	}

	// Check if registration already exists
	const existing = await db.registration.findUnique({
		where: {
			userId_eventId: {
				userId: ctx.user.id,
				eventId: input.eventId,
			},
		},
	});

	if (existing) {
		// Update existing registration
		await db.registration.update({
			where: {
				id: existing.id,
			},
			data: {
				type: input.type,
				comment: input.comment,
			},
		});
	} else {
		// Create new registration
		await db.registration.create({
			data: {
				userId: ctx.user.id,
				eventId: input.eventId,
				type: input.type,
				comment: input.comment,
			},
		});
	}
};

export default authorizedProcedure
	.input(createRegistrationSchema)
	.mutation(handler);
