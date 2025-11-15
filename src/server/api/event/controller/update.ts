import type { User } from "@prisma/client";
import type z from "zod";
import { UpdateEventInputSchema } from "~/schemas";
import { db } from "~/server/db";
import { type Controller, authorizedProcedure } from "../../trpc";
import { hasTeamAccessMiddleware } from "../../util/auth";

const handler: Controller<
	z.infer<typeof UpdateEventInputSchema>,
	void
> = async ({ input, ctx }) => {
	// Check if the user has access
	await hasTeamAccessMiddleware(ctx.user as User, input.teamId, [
		"ADMIN",
		"SUBADMIN",
	]);

	await db.teamEvent.update({
		where: { id: input.id },
		data: {
			name: input.name,
			eventType: input.type,
			startAt: input.datetime,
			endAt: input.endAt,
			location: input.location,
			note: input.note,
		},
	});
};

export default authorizedProcedure
	.input(UpdateEventInputSchema)
	.mutation(handler);
