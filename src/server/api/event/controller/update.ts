import type { User } from "@prisma/client";
import type z from "zod";
import { UpdateEventInputSchema } from "~/schemas";
import { db } from "~/server/db";
import { type Controller, authorizedProcedure } from "../../trpc";
import { hasTeamAccessMiddleware } from "../../util/auth";
import { validateGroupIds } from "../../util/validate-groups";

const handler: Controller<
	z.infer<typeof UpdateEventInputSchema>,
	void
> = async ({ input, ctx }) => {
	// Check if the user has access
	await hasTeamAccessMiddleware(ctx.user as User, input.teamId, [
		"ADMIN",
		"SUBADMIN",
	]);

	const validGroupIds = await validateGroupIds(
		input.teamId,
		input.groupIds ?? [],
	);

	await db.teamEvent.update({
		where: { id: input.id },
		data: {
			name: input.name,
			eventType: input.type,
			startAt: input.startDatetime,
			endAt: input.endDatetime,
			location: input.location,
			note: input.note,
			registrationDeadline: input.registrationDeadline,
			// Utvalget settes på nytt i sin helhet, slik dialogen sender det.
			invitedGroups: {
				deleteMany: {},
				create: validGroupIds.map((groupId) => ({ groupId })),
			},
		},
	});
};

export default authorizedProcedure
	.input(UpdateEventInputSchema)
	.mutation(handler);
