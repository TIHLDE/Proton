import type { User } from "@prisma/client";
import type z from "zod";
import { DeleteEventInputSchema } from "~/schemas";
import { db } from "~/server/db";
import { hasTeamAccess } from "~/services";
import { type Controller, authorizedProcedure } from "../../trpc";

const handler: Controller<
	z.infer<typeof DeleteEventInputSchema>,
	void
> = async ({ input, ctx }) => {
	// Check if user has access
	await hasTeamAccess(input.teamId, ctx.user as User);

	await db.teamEvent.delete({
		where: { id: input.id },
	});
};

export default authorizedProcedure
	.input(DeleteEventInputSchema)
	.mutation(handler);
