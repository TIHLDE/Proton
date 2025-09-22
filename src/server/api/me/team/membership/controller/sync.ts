import { TRPCError } from "@trpc/server";
import { getTIHLDEToken, getUserMemberships } from "~/actions";
import { type Controller, authorizedProcedure } from "~/server/api/trpc";

const handler: Controller<void, void> = async ({ ctx, input }) => {
	// Get TIHLDE token
	const token = await getTIHLDEToken();

	// Get memberships from TIHLDE
	const membershipResponse = await getUserMemberships(token || "");

	const memberships = membershipResponse?.results.map((membership) => ({
		groupSlug: membership.group.slug,
		role: membership.membership_type === "MEMBER" ? "USER" : "ADMIN",
	}));

	if (!memberships) {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: "Kunne ikke hente medlemskap fra TIHLDE.",
		});
	}

	// Find existing teams with the same slug as the memberships
	const existingTeams = await ctx.db.team.findMany({
		where: {
			slug: {
				in: memberships.map((membership) => membership.groupSlug),
			},
		},
	});

	// Sync memberships
	await Promise.all(
		memberships.map(async (membership) => {
			const team = existingTeams.find(
				(team) => team.slug === membership.groupSlug,
			);

			if (!team) {
				return;
			}

			// Check if membership already exists
			const existingMembership = await ctx.db.teamMember.findFirst({
				where: {
					userId: ctx.user.id,
					teamId: team.id,
				},
			});

			if (existingMembership) {
				// Update role if it has changed
				if (existingMembership.role !== membership.role) {
					await ctx.db.teamMember.update({
						where: {
							id: existingMembership.id,
						},
						data: {
							role: membership.role,
						},
					});
				}
				return;
			}

			// Create membership
			await ctx.db.teamMember.create({
				data: {
					userId: ctx.user.id,
					teamId: team.id,
					role: membership.role,
				},
			});
		}),
	);
};

export default authorizedProcedure.mutation(handler);
