import type { User } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import type z from "zod";
import { deleteRegistrationSchema } from "~/schemas";
import { db } from "~/server/db";
import { type Controller, authorizedProcedure } from "../../trpc";
import { hasTeamAccessMiddleware } from "../../util/auth";

const handler: Controller<
	z.infer<typeof deleteRegistrationSchema>,
	void
> = async ({ input, ctx }) => {
	// Get the registration to check team access and ownership
	const registration = await db.registration.findUnique({
		where: { id: input.id },
		select: {
			userId: true,
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

	// Verify the registration belongs to the user
	if (registration.userId !== ctx.user.id) {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "Du kan ikke slette en annen brukers påmelding",
		});
	}

	await db.registration.delete({
		where: {
			id: input.id,
		},
	});
};

export default authorizedProcedure
	.input(deleteRegistrationSchema)
	.mutation(handler);
