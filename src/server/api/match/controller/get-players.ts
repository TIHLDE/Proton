import type { User } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import type z from "zod";
import { GetMatchSchema } from "~/schemas";
import { db } from "~/server/db";
import { type Controller, authorizedProcedure } from "../../trpc";
import { hasTeamAccessMiddleware } from "../../util/auth";

type Player = { id: string; name: string };

const handler: Controller<z.infer<typeof GetMatchSchema>, Player[]> = async ({
	input,
	ctx,
}) => {
	const event = await db.teamEvent.findUnique({
		where: { id: input.eventId },
		select: { teamId: true },
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
	]);

	const members = await db.teamMember.findMany({
		where: { teamId: event.teamId },
		select: { user: { select: { id: true, name: true } } },
		orderBy: { user: { name: "asc" } },
	});

	return members.map((member) => member.user);
};

export default authorizedProcedure.input(GetMatchSchema).query(handler);
