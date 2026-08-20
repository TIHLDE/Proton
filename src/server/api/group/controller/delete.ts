import type { User } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import type z from "zod";
import { DeleteTeamGroupSchema } from "~/schemas";
import { type Controller, authorizedProcedure } from "../../trpc";
import { hasTeamAccessMiddleware } from "../../util/auth";

const handler: Controller<
	z.infer<typeof DeleteTeamGroupSchema>,
	void
> = async ({ input, ctx }) => {
	const group = await ctx.db.teamGroup.findUnique({
		where: { id: input.groupId },
	});

	if (!group) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: "Undergruppen finnes ikke.",
		});
	}

	await hasTeamAccessMiddleware(ctx.user as User, group.teamId, [
		"ADMIN",
		"SUBADMIN",
	]);

	await ctx.db.teamGroup.delete({
		where: { id: group.id },
	});
};

export default authorizedProcedure
	.input(DeleteTeamGroupSchema)
	.mutation(handler);
