import type { User } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import type z from "zod";
import { deleteRegistrationSchema } from "~/schemas";
import { db } from "~/server/db";
import { deleteRegistration } from "~/services";
import { type Controller, authorizedProcedure } from "../../trpc";
import { hasTeamAccessMiddleware } from "../../util/auth";

const handler: Controller<
	z.infer<typeof deleteRegistrationSchema>,
	void
> = async ({ input, ctx }) => {
	// Get the registration to check team access
	const registration = await db.registration.findUnique({
		where: { id: input.id },
		select: {
			event: {
				select: { teamId: true },
			},
		},
	});

	if (!registration) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: "Påmelding ikke funnet",
		});
	}

	// Check if user has access to the team
	await hasTeamAccessMiddleware(ctx.user as User, registration.event.teamId, [
		"ADMIN",
		"USER",
	]);

	await deleteRegistration(input.id, ctx.user.id);
};

export default authorizedProcedure
	.input(deleteRegistrationSchema)
	.mutation(handler);
