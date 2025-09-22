"use server";

import { db } from "~/server/db";

export async function getTeamMemberships(teamId: string) {
	const memberships = await db.teamMember.findMany({
		where: {
			teamId,
		},
		include: {
			user: true,
		},
	});
}
