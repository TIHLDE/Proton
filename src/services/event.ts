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
			startAt: { lte: new Date() },
		},
		orderBy: {
			startAt: "asc",
		},
	});

	return events;
};
