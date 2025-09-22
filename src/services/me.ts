"use server";

import { db } from "~/server/db";

export async function getMyTeamMemberships(userId: string) {
	const memberships = await db.teamMember.findMany({
		where: {
			userId,
		},
		include: {
			team: true,
		},
	});

	return memberships;
}
