"use server";

import { db } from "~/server/db";

export async function getAllTeams() {
	const teams = await db.team.findMany();

	return teams;
}

export async function hasTeamAccess(teamId: string, userId: string) {
	const membership = await db.teamMember.findFirst({
		where: {
			teamId,
			userId,
		},
	});

	if (!membership) return null;

	return membership.role;
}

export async function getTeam(teamId: string) {
	const team = await db.team.findUnique({
		where: {
			id: teamId,
		},
	});

	return team;
}
