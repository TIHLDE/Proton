import type { MatchEventType, User } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import type z from "zod";
import { GetMatchSchema } from "~/schemas";
import { db } from "~/server/db";
import { type Controller, authorizedProcedure } from "../../trpc";
import { hasTeamAccessMiddleware } from "../../util/auth";

type MatchDetails = {
	homeGoals: number;
	awayGoals: number;
	hasResult: boolean;
	events: {
		id: string;
		type: MatchEventType;
		user: { id: string; name: string };
	}[];
};

const handler: Controller<
	z.infer<typeof GetMatchSchema>,
	MatchDetails
> = async ({ input, ctx }) => {
	const event = await db.teamEvent.findUnique({
		where: { id: input.eventId },
		select: { teamId: true, eventType: true },
	});

	if (!event) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: "Arrangement ikke funnet",
		});
	}

	await hasTeamAccessMiddleware(ctx.user as User, event.teamId, [
		"ADMIN",
		"SUBADMIN",
		"USER",
	]);

	const match = await db.match.findUnique({
		where: { eventId: input.eventId },
		include: {
			events: {
				include: { user: { select: { id: true, name: true } } },
				orderBy: { createdAt: "asc" },
			},
		},
	});

	if (!match) {
		return { homeGoals: 0, awayGoals: 0, hasResult: false, events: [] };
	}

	return {
		homeGoals: match.homeGoals,
		awayGoals: match.awayGoals,
		hasResult: true,
		events: match.events.map((matchEvent) => ({
			id: matchEvent.id,
			type: matchEvent.type,
			user: matchEvent.user,
		})),
	};
};

export default authorizedProcedure.input(GetMatchSchema).query(handler);
