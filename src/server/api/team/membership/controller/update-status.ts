import type { User } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import type z from "zod";
import { UpdateTeamMembershipStatusSchema } from "~/schemas";
import { type Controller, authorizedProcedure } from "~/server/api/trpc";
import { hasTeamAccessMiddleware } from "~/server/api/util/auth";

const handler: Controller<
	z.infer<typeof UpdateTeamMembershipStatusSchema>,
	void
> = async ({ input, ctx }) => {
	await hasTeamAccessMiddleware(ctx.user as User, input.teamId, [
		"ADMIN",
		"SUBADMIN",
	]);

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
			isActive: input.isActive,
			inactiveComment: input.isActive ? null : input.comment,
		},
	});
};

export default authorizedProcedure
	.input(UpdateTeamMembershipStatusSchema)
	.mutation(handler);
