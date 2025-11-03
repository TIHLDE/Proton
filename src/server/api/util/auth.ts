import type { TeamRole, User } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";

export async function hasTeamAccessMiddleware(
	user: User,
	teamId: string,
	roles: TeamRole[],
) {
	if (user.isAdmin) return;

	const membership = await db.teamMember.findFirst({
		where: {
			teamId,
			userId: user.id,
		},
	});

	if (!membership || !roles.includes(membership.role)) {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "Du har ikke tilgang til å gjøre dette.",
		});
	}
}
