import { TRPCError } from "@trpc/server";
import type z from "zod";
import { DeleteTeamInputSchema } from "~/schemas";
import { type Controller, authorizedProcedure } from "../../trpc";

const handler: Controller<
	z.infer<typeof DeleteTeamInputSchema>,
	void
> = async ({ input, ctx }) => {
	// Check if user is superadmin
	if (!ctx.user?.isAdmin) {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "Du har ikke tilgang til å slette lag.",
		});
	}

	await ctx.db.team.delete({
		where: { id: input.id },
	});
};

export default authorizedProcedure
	.input(DeleteTeamInputSchema)
	.mutation(handler);