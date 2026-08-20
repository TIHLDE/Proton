import type { User } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import type z from "zod";
import { DeleteMatchEventSchema } from "~/schemas";
import { db } from "~/server/db";
import { type Controller, authorizedProcedure } from "../../trpc";
import { hasTeamAccessMiddleware } from "../../util/auth";

const handler: Controller<
	z.infer<typeof DeleteMatchEventSchema>,
	void
> = async ({ input, ctx }) => {
	const matchEvent = await db.matchEvent.findUnique({
		where: { id: input.matchEventId },
		select: { match: { select: { event: { select: { teamId: true } } } } },
	});

	if (!matchEvent) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: "Hendelsen finnes ikke",
		});
	}

	await hasTeamAccessMiddleware(
		ctx.user as User,
		matchEvent.match.event.teamId,
		["ADMIN", "SUBADMIN"],
	);

	await db.matchEvent.delete({ where: { id: input.matchEventId } });
};

export default authorizedProcedure
	.input(DeleteMatchEventSchema)
	.mutation(handler);
