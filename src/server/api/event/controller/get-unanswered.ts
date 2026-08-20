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
			registrations: {
				none: {
					userId: userId,
				},
			},
			// Arrangementer som bare er åpne for utvalgte undergrupper skal
			// ikke mase på folk som uansett ikke kan melde seg på.
			OR: [
				{ invitedGroups: { none: {} } },
				{
					invitedGroups: {
						some: { group: { members: { some: { userId: userId } } } },
					},
				},
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
