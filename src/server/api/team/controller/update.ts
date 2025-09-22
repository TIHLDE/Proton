import { TRPCError } from "@trpc/server";
import type z from "zod";
import { UpdateTeamInputSchema } from "~/schemas";
import { type Controller, authorizedProcedure } from "../../trpc";

const handler: Controller<
	z.infer<typeof UpdateTeamInputSchema>,
	void
> = async ({ input, ctx }) => {
	// Check if user is superadmin
	if (!ctx.user?.isAdmin) {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "Du har ikke tilgang til å oppdatere lag.",
		});
	}

	// Check if team exists
	const existingTeam = await ctx.db.team.findUnique({
		where: { id: input.id },
	});

	if (!existingTeam) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: "Laget finnes ikke.",
		});
	}

	// Check if another team with same name or slug exists (excluding current team)
	if (input.name !== existingTeam.name || input.slug !== existingTeam.slug) {
		const duplicateTeam = await ctx.db.team.findFirst({
			where: {
				AND: [
					{ id: { not: input.id } },
					{
						OR: [
							{ name: input.name },
							{ slug: input.slug },
						],
					},
				],
			},
		});

		if (duplicateTeam) {
			throw new TRPCError({
				code: "CONFLICT",
				message: "Et annet lag med samme navn eller slug finnes allerede.",
			});
		}
	}

	await ctx.db.team.update({
		where: { id: input.id },
		data: {
			name: input.name,
			slug: input.slug,
		},
	});
};

export default authorizedProcedure
	.input(UpdateTeamInputSchema)
	.mutation(handler);