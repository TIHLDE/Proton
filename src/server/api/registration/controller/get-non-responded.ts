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

	// Check if user has access to the team
	await hasTeamAccessMiddleware(ctx.user as User, event.teamId, [
		"ADMIN",
		"SUBADMIN",
		"USER",
	]);

	// Get all team members
	const teamMembers = await db.teamMember.findMany({
		where: {
			teamId: event.teamId,
		},
		include: {
			user: {
				select: {
					id: true,
					name: true,
					image: true,
				},
			},
		},
	});

	// Get all registrations for this event
	const registrations = await db.registration.findMany({
		where: {
			eventId: input.eventId,
		},
		select: {
			userId: true,
		},
	});

	const registeredUserIds = new Set(registrations.map((r) => r.userId));

	// Filter team members who haven't registered
	const nonResponded = teamMembers
		.filter((member) => !registeredUserIds.has(member.userId))
		.map((member) => ({
			id: member.id,
			user: member.user,
		}));

	return nonResponded;
};

export default authorizedProcedure
	.input(getRegistrationByEventSchema)
	.query(handler);
