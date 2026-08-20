import type { User } from "@prisma/client";
import { z } from "zod";
import { findSeason, getSeasons } from "~/lib/season";
import { MATCH_EVENT_TYPES } from "~/schemas";
import { db } from "~/server/db";
import { type Controller, authorizedProcedure } from "../../trpc";
import { hasTeamAccessMiddleware } from "../../util/auth";

const inputSchema = z.object({
	teamId: z.string().min(1),
	type: z.enum(MATCH_EVENT_TYPES).default("GOAL"),
	seasonId: z.string().optional(),
	groupId: z.string().optional(),
});

type PlayerStat = {
	userId: string;
	userName: string;
	count: number;
};

const handler: Controller<z.infer<typeof inputSchema>, PlayerStat[]> = async ({
	input,
	ctx,
}) => {
	await hasTeamAccessMiddleware(ctx.user as User, input.teamId, [
		"ADMIN",
		"SUBADMIN",
		"USER",
	]);

	const season = input.seasonId
		? findSeason(getSeasons(new Date(2000, 0, 1)), input.seasonId)
		: undefined;

	const rows = await db.matchEvent.findMany({
		where: {
			type: input.type,
			match: {
				event: {
					teamId: input.teamId,
					...(season ? { startAt: { gte: season.from, lt: season.to } } : {}),
					...(input.groupId
						? { invitedGroups: { some: { groupId: input.groupId } } }
						: {}),
				},
			},
		},
		select: { userId: true, user: { select: { name: true } } },
	});

	const counts = new Map<string, PlayerStat>();
	for (const row of rows) {
		const existing = counts.get(row.userId);
		if (existing) {
			existing.count += 1;
			continue;
		}
		counts.set(row.userId, {
			userId: row.userId,
			userName: row.user.name,
			count: 1,
		});
	}

	return [...counts.values()].sort(
		(a, b) => b.count - a.count || a.userName.localeCompare(b.userName, "nb"),
	);
};

export default authorizedProcedure.input(inputSchema).query(handler);
