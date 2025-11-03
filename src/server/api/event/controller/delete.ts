import type { User } from "@prisma/client";
import type z from "zod";
import { DeleteEventInputSchema } from "~/schemas";
import { db } from "~/server/db";
import { type Controller, authorizedProcedure } from "../../trpc";
import { hasTeamAccessMiddleware } from "../../util/auth";

const handler: Controller<
	z.infer<typeof DeleteEventInputSchema>,
	void
> = async ({ input, ctx }) => {
	// Check if user has access
	await hasTeamAccessMiddleware(ctx.user as User, input.teamId, ["ADMIN"]);

	await db.teamEvent.delete({
		where: { id: input.id },
	});
};

export default authorizedProcedure
	.input(DeleteEventInputSchema)
	.mutation(handler);
