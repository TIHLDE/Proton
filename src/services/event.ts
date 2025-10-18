import type { TeamEventType } from "@prisma/client";
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

		// Transform the data to match what our components expect
		return events.map((event) => ({
			id: event.id,
			name: event.name,
			datetime: event.startAt,
			type: event.eventType,
			location: event.location,
			note: event.note,
		}));
	} catch (error) {
		console.error("Error fetching events by team ID:", error);
		return [];
	}
};
