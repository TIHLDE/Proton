import { db } from "~/server/db";

export const getAllEventsByTeamId = async (teamId: string) => {
	try {
		const events = await db.teamEvent.findMany({
			where: {
				teamId: teamId,
			},
			orderBy: {
				startAt: "asc",
			},
		});

		return events;
	} catch (error) {
		console.error("Error fetching events by team ID:", error);
		return [];
	}
};
