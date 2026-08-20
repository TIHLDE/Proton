"use server";

import { db } from "~/server/db";

export async function getTeamGroups(teamId: string) {
	const groups = await db.teamGroup.findMany({
		where: { teamId },
		include: {
			members: {
				include: {
					user: {
						select: { id: true, name: true, image: true },
					},
				},
				orderBy: { user: { name: "asc" } },
			},
		},
		orderBy: { name: "asc" },
	});

	return groups;
}

export async function getTeamGroup(groupId: string) {
	const group = await db.teamGroup.findUnique({
		where: { id: groupId },
		include: {
			members: {
				include: {
					user: {
						select: { id: true, name: true, image: true },
					},
				},
			},
		},
	});

	return group;
}

/** Alle medlemmer av laget, til å velge fra når en undergruppe settes opp. */
export async function getTeamMembersForSelection(teamId: string) {
	const members = await db.teamMember.findMany({
		where: { teamId },
		include: {
			user: {
				select: { id: true, name: true, image: true },
			},
		},
		orderBy: { user: { name: "asc" } },
	});

	return members.map((member) => member.user);
}
