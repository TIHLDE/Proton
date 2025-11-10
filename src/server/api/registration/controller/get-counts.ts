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

	return {
		attending:
			registrations.find((r) => r.type === "ATTENDING")?._count.type ?? 0,
		notAttending:
			registrations.find((r) => r.type === "NOT_ATTENDING")?._count.type ?? 0,
	};
};

export default authorizedProcedure
	.input(getRegistrationByEventSchema)
	.query(handler);
