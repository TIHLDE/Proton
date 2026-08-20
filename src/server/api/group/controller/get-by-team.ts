import type { User } from "@prisma/client";
import { z } from "zod";
import { type Controller, authorizedProcedure } from "../../trpc";
import { hasTeamAccessMiddleware } from "../../util/auth";

const inputSchema = z.object({
	teamId: z.string().min(1),
});

type TeamGroupListItem = {
	id: string;
	name: string;
	memberCount: number;
};

const handler: Controller<
	z.infer<typeof inputSchema>,
	TeamGroupListItem[]
> = async ({ input, ctx }) => {
	await hasTeamAccessMiddleware(ctx.user as User, input.teamId, [
		"ADMIN",
		"SUBADMIN",
		"USER",
	]);

	const groups = await ctx.db.teamGroup.findMany({
		where: { teamId: input.teamId },
		select: {
			id: true,
			name: true,
			_count: { select: { members: true } },
		},
		orderBy: { name: "asc" },
	});

	return groups.map((group) => ({
		id: group.id,
		name: group.name,
		memberCount: group._count.members,
	}));
};

export default authorizedProcedure.input(inputSchema).query(handler);
