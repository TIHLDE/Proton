import type { User } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import type z from "zod";
import { CreateTeamGroupSchema } from "~/schemas";
import { type Controller, authorizedProcedure } from "../../trpc";
import { hasTeamAccessMiddleware } from "../../util/auth";

const handler: Controller<
	z.infer<typeof CreateTeamGroupSchema>,
	void
> = async ({ input, ctx }) => {
	await hasTeamAccessMiddleware(ctx.user as User, input.teamId, [
		"ADMIN",
		"SUBADMIN",
	]);

	const existing = await ctx.db.teamGroup.findFirst({
		where: {
			teamId: input.teamId,
			name: input.name,
		},
	});

	if (existing) {
		throw new TRPCError({
			code: "CONFLICT",
			message: "Laget har allerede en undergruppe med dette navnet.",
		});
	}

	await ctx.db.teamGroup.create({
		data: {
			teamId: input.teamId,
			name: input.name,
			description: input.description || null,
		},
	});
};

export default authorizedProcedure
	.input(CreateTeamGroupSchema)
	.mutation(handler);
