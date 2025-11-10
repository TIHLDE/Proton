import type { User } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import type z from "zod";
import { createRegistrationSchema } from "~/schemas";
import { db } from "~/server/db";
import { createRegistration } from "~/services";
import { type Controller, authorizedProcedure } from "../../trpc";
import { hasTeamAccessMiddleware } from "../../util/auth";

const handler: Controller<
	z.infer<typeof createRegistrationSchema>,
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

	// Check if user has access to the team
	await hasTeamAccessMiddleware(ctx.user as User, event.teamId, [
		"ADMIN",
		"USER",
	]);

	await createRegistration(
		ctx.user.id,
		input.eventId,
		input.type,
		input.comment,
	);
};

export default authorizedProcedure
	.input(createRegistrationSchema)
	.mutation(handler);
