import type { TeamRole } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { getUserMemberships } from "~/actions";
import { type Controller, authorizedProcedure } from "~/server/api/trpc";

const handler: Controller<void, void> = async ({ ctx }) => {
	// Hentes fra Photon med access-tokenet OAuth-flyten lagret.
	const membershipResponse = await getUserMemberships();

	// Photon nøster medlemskapet inni gruppa, motsatt av Lepton. En gruppe
	// uten membership skal ikke gi ADMIN ved et uhell, så den hoppes over.
	const memberships = membershipResponse
		?.filter((group) => group.membership !== null)
		.map((group) => ({
			groupSlug: group.slug,
			role: group.membership?.role === "leader" ? "ADMIN" : "USER",
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
							role: membership.role as TeamRole,
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
					role: membership.role as TeamRole,
				},
			});
		}),
	);
};

export default authorizedProcedure.mutation(handler);
