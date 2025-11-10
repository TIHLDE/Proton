import type { User } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import type z from "zod";
import { getRegistrationByEventSchema } from "~/schemas";
import { db } from "~/server/db";
import { getRegistrationCountsByEvent } from "~/services";
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

	return await getRegistrationCountsByEvent(input.eventId);
};

export default authorizedProcedure
	.input(getRegistrationByEventSchema)
	.query(handler);
