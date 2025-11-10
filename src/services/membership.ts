"use server";

import { db } from "~/server/db";

export async function getTeamMemberships(
	teamId: string,
	page?: number,
	search?: string,
) {
	const pageSize = 20;
	const queryPage = page || 1;
	const skip = queryPage ? (queryPage - 1) * pageSize : 0;
	const take = pageSize;

	const memberships = await db.teamMember.findMany({
		where: {
			teamId,
			...(search && {
				user: {
					name: {
						contains: search,
						mode: "insensitive",
					},
				},
			}),
		},
		include: {
			user: true,
		},
		skip,
		take,
		orderBy: {
			createdAt: "desc",
		},
	});

	const membershipsCount = await db.teamMember.count({
		where: {
			teamId,
			...(search && {
				user: {
					name: {
						contains: search,
						mode: "insensitive",
					},
				},
			}),
		},
	});

	return {
		memberships,
		nextPage: memberships.length === pageSize ? queryPage + 1 : null,
		totalPages: Math.ceil(membershipsCount / pageSize),
	};
}

export async function getTeamMembershipsCount(teamId: string) {
	const count = await db.teamMember.count({
		where: {
			teamId,
		},
	});

	return count;
}

export async function getDistinctMembersCount() {
	const result = await db.teamMember.groupBy({
		by: ["userId"],
		_count: {
			userId: true,
		},
	});

	return result.length;
}

export async function getTeamMembershipRoles(userId: string, teamId: string) {
	const roles = await db.teamMember.findMany({
		where: {
			userId,
			teamId,
		},
		select: {
			role: true,
		},
	});

	return roles.map((membership) => membership.role);
}
