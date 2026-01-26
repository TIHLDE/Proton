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
			endAt: { gte: new Date() },
		},
		orderBy: {
			startAt: "asc",
		},
	});

	return events;
};

export const getAllPastEventsByTeamId = async (teamId: string) => {
	const events = await db.teamEvent.findMany({
		where: {
			teamId: teamId,
			endAt: { lt: new Date() },
		},
		orderBy: {
			startAt: "desc",
		},
	});

	return events;
};

export const getAllMyEvents = async (
	userId: string,
	startDate: Date,
	endDate: Date,
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
				gte: startDate,
				lt: endDate,
			},
		},
		orderBy: {
			startAt: "asc",
		},
	});

	return events;
};
