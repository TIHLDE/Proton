import type { TeamRole, User } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import type z from "zod";
import { UpdateTeamMembershipRoleSchema } from "~/schemas";
import { type Controller, authorizedProcedure } from "~/server/api/trpc";
import { hasTeamAccessMiddleware } from "~/server/api/util/auth";

const handler: Controller<
	z.infer<typeof UpdateTeamMembershipRoleSchema>,
	void
> = async ({ input, ctx }) => {
	// Check if user has accsess
	await hasTeamAccessMiddleware(ctx.user as User, input.teamId, ["ADMIN"]);

	const membership = await ctx.db.teamMember.findUnique({
		where: {
			id: input.membershipId,
		},
	});

	if (!membership) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: "Medlemskapet finnes ikke.",
		});
	}

	await ctx.db.teamMember.update({
		where: {
			userId_teamId: {
				userId: membership.userId,
				teamId: membership.teamId,
			},
		},
		data: {
			role: input.role as TeamRole,
		},
	});
};

export default authorizedProcedure
	.input(UpdateTeamMembershipRoleSchema)
	.mutation(handler);
