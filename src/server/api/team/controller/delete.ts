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

	// Check if team exists
	const existingTeam = await ctx.db.team.findUnique({
		where: { id: input.id },
		include: {
			_count: {
				select: {
					members: true,
				},
			},
		},
	});

	if (!existingTeam) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: "Laget finnes ikke.",
		});
	}

	// Check if team has members
	if (existingTeam._count.members > 0) {
		throw new TRPCError({
			code: "CONFLICT",
			message: "Kan ikke slette lag som har medlemmer. Fjern alle medlemmer først.",
		});
	}

	await ctx.db.team.delete({
		where: { id: input.id },
	});
};

export default authorizedProcedure
	.input(DeleteTeamInputSchema)
	.mutation(handler);