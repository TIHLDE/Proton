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
	const membership = await ctx.db.teamMember.findUnique({
		where: {
			id: input.membershipId,
		},
	});

	// Et medlemskap i et annet lag enn det klienten oppgir svarer likt som et
	// som ikke finnes, så feilen ikke røper at id-en er ekte.
	if (!membership || membership.teamId !== input.teamId) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: "Medlemskapet finnes ikke.",
		});
	}

	// Tilgangen sjekkes mot laget medlemskapet faktisk hører til, så admin i
	// ett lag ikke kan endre roller i et annet.
	await hasTeamAccessMiddleware(ctx.user as User, membership.teamId, ["ADMIN"]);

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
