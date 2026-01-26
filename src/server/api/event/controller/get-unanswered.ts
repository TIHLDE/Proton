import type { TeamEvent } from "@prisma/client";
import { type Controller, authorizedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

type UnansweredEvent = TeamEvent & {
	team: {
		name: string;
	};
};

const handler: Controller<void, UnansweredEvent[]> = async ({ ctx }) => {
	const userId = ctx.user.id;

	// Get all events from teams the user is a member of
	// where the event is in the future
	// and the user hasn't registered (or registration is null)
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
				gte: new Date(),
			},
			OR: [
				// No registration exists
				{
					registrations: {
						none: {
							userId: userId,
						},
					},
				},
				// Registration exists but is neither ATTENDING nor NOT_ATTENDING
				// This shouldn't happen with current schema, but keeping for safety
			],
		},
		include: {
			team: {
				select: {
					name: true,
				},
			},
		},
		orderBy: {
			startAt: "asc",
		},
	});

	return events;
};

export default authorizedProcedure.query(handler);
