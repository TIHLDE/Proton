import { db } from "~/server/db";

export const getAllEventsByTeamId = async (teamId: string) => {
	const events = await db.teamEvent.findMany({
		where: {
			teamId: teamId,
		},
		orderBy: {
			startAt: "asc",
		},
	});

	return events;
};

export const getAllOngoingEventsByTeamId = async (teamId: string) => {
	const events = await db.teamEvent.findMany({
		where: {
			teamId: teamId,
			startAt: { gte: new Date() },
		},
		orderBy: {
			startAt: "asc",
		},
	});

	return events;
};

export const getAllMyEvents = async (
	userId: string,
	month: number,
	year: number,
) => {
	const events = await db.teamEvent.findMany({
		where: {
			team: {
				members: {
					some: {
						userId: userId,
					},
				},
			},
			startAt: {
				gte: new Date(year, month - 1, 1),
				lt: new Date(year, month, 1),
			},
		},
		orderBy: {
			startAt: "asc",
		},
	});

	return events;
};
