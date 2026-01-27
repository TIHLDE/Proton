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

	const registrations = await db.registration.groupBy({
		by: ["type"],
		where: {
			eventId: input.eventId,
		},
		_count: {
			type: true,
		},
	});

	// Get total team members count
	const totalTeamMembers = await db.teamMember.count({
		where: {
			teamId: event.teamId,
		},
	});

	// Get total number of users who have responded (either attending or not attending)
	const totalResponded = await db.registration.count({
		where: {
			eventId: input.eventId,
		},
	});

	const attending =
		registrations.find((r) => r.type === "ATTENDING")?._count.type ?? 0;
	const notAttending =
		registrations.find((r) => r.type === "NOT_ATTENDING")?._count.type ?? 0;
	const notResponded = totalTeamMembers - totalResponded;

	return {
		attending,
		notAttending,
		notResponded,
	};
};

export default authorizedProcedure
	.input(getRegistrationByEventSchema)
	.query(handler);
