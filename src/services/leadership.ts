"use server";

import { db } from "~/server/db";

export async function getTeamPositions(teamId: string) {
	return db.teamPosition.findMany({
		where: { teamId },
		orderBy: [{ order: "asc" }, { name: "asc" }],
	});
}

/**
 * Periodene med tildelingene sine, nyeste først. Rekkefølgen betyr noe:
 * visningen sammenligner hver periode med den forrige for å vise hvem som
 * ble gjenvalgt.
 */
export async function getLeadershipPeriods(teamId: string) {
	const periods = await db.leadershipPeriod.findMany({
		where: { teamId },
		orderBy: { startDate: "desc" },
		include: {
			assignments: {
				include: {
					position: { select: { id: true, name: true, order: true } },
					user: { select: { id: true, name: true } },
				},
			},
		},
	});

	return periods.map((period, index) => {
		const previous = periods[index + 1];

		const assignments = period.assignments
			.map((assignment) => ({
				id: assignment.id,
				positionId: assignment.positionId,
				positionName: assignment.position.name,
				order: assignment.position.order,
				user: assignment.user,
				reElected:
					previous?.assignments.some(
						(other) =>
							other.positionId === assignment.positionId &&
							other.userId === assignment.userId,
					) ?? false,
			}))
			.sort(
				(a, b) =>
					a.order - b.order ||
					a.positionName.localeCompare(b.positionName, "nb") ||
					a.user.name.localeCompare(b.user.name, "nb"),
			);

		return {
			id: period.id,
			name: period.name,
			startDate: period.startDate,
			endDate: period.endDate,
			isOldest: index === periods.length - 1,
			assignments,
		};
	});
}
