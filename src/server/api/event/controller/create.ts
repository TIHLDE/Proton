import type { User } from "@prisma/client";
import type z from "zod";
import { CreateEventInputSchema } from "~/schemas";
import { db } from "~/server/db";
import { hasTeamAccess } from "~/services";
import { type Controller, authorizedProcedure } from "../../trpc";

const handler: Controller<
	z.infer<typeof CreateEventInputSchema>,
	void
> = async ({ input, ctx }) => {
	// Check if user has access
	await hasTeamAccess(input.teamId, ctx.user as User);

	await db.teamEvent.create({
		data: {
			teamId: input.teamId,
			name: input.name,
			eventType: input.type,
			startAt: input.datetime,
			endAt: input.datetime,
			location: input.location,
			note: input.note,
		},
	});
};

export default authorizedProcedure
	.input(CreateEventInputSchema)
	.mutation(handler);
