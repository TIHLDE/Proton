import type { User } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import type z from "zod";
import { SetTeamMemberInactiveSchema } from "~/schemas";
import { type Controller, authorizedProcedure } from "~/server/api/trpc";
import { hasTeamAccessMiddleware } from "~/server/api/util/auth";

const handler: Controller<
	z.infer<typeof SetTeamMemberInactiveSchema>,
	void
> = async ({ input, ctx }) => {
	const membership = await ctx.db.teamMember.findUnique({
		where: { id: input.membershipId },
		select: { id: true, teamId: true, inactiveSince: true },
	});

	if (!membership) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: "Medlemskapet finnes ikke.",
		});
	}

	// Tilgangen sjekkes mot laget medlemskapet faktisk hører til, ikke et
	// teamId fra klienten — ellers kunne ledelsen i ett lag endre et annet.
	await hasTeamAccessMiddleware(ctx.user as User, membership.teamId, [
		"ADMIN",
		"SUBADMIN",
	]);

	await ctx.db.teamMember.update({
		where: { id: membership.id },
		data: input.inactive
			? {
					// Endres bare begrunnelsen, står den opprinnelige datoen.
					inactiveSince: membership.inactiveSince ?? new Date(),
					inactiveReason: input.reason,
				}
			: { inactiveSince: null, inactiveReason: null },
	});
};

export default authorizedProcedure
	.input(SetTeamMemberInactiveSchema)
	.mutation(handler);
