import type { User } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import type z from "zod";
import { SaveMatchResultSchema } from "~/schemas";
import { db } from "~/server/db";
import { type Controller, authorizedProcedure } from "../../trpc";
import { hasTeamAccessMiddleware } from "../../util/auth";

const handler: Controller<
	z.infer<typeof SaveMatchResultSchema>,
	void
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

	if (event.eventType !== "MATCH") {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: "Bare kamper kan ha et resultat.",
		});
	}

	await hasTeamAccessMiddleware(ctx.user as User, event.teamId, [
		"ADMIN",
		"SUBADMIN",
	]);

	await db.match.upsert({
		where: { eventId: input.eventId },
		create: {
			eventId: input.eventId,
			homeGoals: input.homeGoals,
			awayGoals: input.awayGoals,
		},
		update: {
			homeGoals: input.homeGoals,
			awayGoals: input.awayGoals,
		},
	});
};

export default authorizedProcedure
	.input(SaveMatchResultSchema)
	.mutation(handler);
