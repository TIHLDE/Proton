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

	// Slettes en gruppe, mister arrangementene den. De som da ikke har noen
	// grupper igjen, blir åpne for hele laget. Det er verdt en advarsel, så
	// her regnes det ut hvor mange det gjelder per gruppe.
	const upcoming = await db.teamEvent.findMany({
		where: { teamId, startAt: { gte: new Date() } },
		select: { invitedGroups: { select: { groupId: true } } },
	});

	const opensUpIfDeleted = new Map<string, number>();
	for (const event of upcoming) {
		const [onlyGroup] = event.invitedGroups;
		if (!onlyGroup || event.invitedGroups.length !== 1) continue;
		opensUpIfDeleted.set(
			onlyGroup.groupId,
			(opensUpIfDeleted.get(onlyGroup.groupId) ?? 0) + 1,
		);
	}

	return groups.map((group) => ({
		...group,
		opensUpIfDeleted: opensUpIfDeleted.get(group.id) ?? 0,
	}));
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
