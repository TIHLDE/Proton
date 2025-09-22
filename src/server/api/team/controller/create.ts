import { TRPCError } from "@trpc/server";
import type z from "zod";
import { CreateTeamInputSchema } from "~/schemas";
import { type Controller, authorizedProcedure } from "../../trpc";

const handler: Controller<
	z.infer<typeof CreateTeamInputSchema>,
	void
> = async ({ input, ctx }) => {
	// Check if user is superadmin
	if (!ctx.user?.isAdmin) {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "Du har ikke tilgang til å opprette lag.",
		});
	}

	// Check if team with same name or slug exists
	const existingTeam = await ctx.db.team.findFirst({
		where: {
			OR: [{ name: input.name }, { slug: input.slug }],
		},
	});

	if (existingTeam) {
		throw new TRPCError({
			code: "CONFLICT",
			message: "Et lag med samme navn eller slug finnes allerede.",
		});
	}

	await ctx.db.team.create({
		data: {
			name: input.name,
			slug: input.slug,
		},
	});
};

export default authorizedProcedure
	.input(CreateTeamInputSchema)
	.mutation(handler);
