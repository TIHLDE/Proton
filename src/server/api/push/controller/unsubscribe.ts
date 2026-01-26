import type { User } from "@prisma/client";
import type z from "zod";
import { UnsubscribePushInputSchema } from "~/schemas";
import { type Controller, authorizedProcedure } from "../../trpc";

const handler: Controller<
	z.infer<typeof UnsubscribePushInputSchema>,
	void
> = async ({ input, ctx }) => {
	const user = ctx.user as User;

	await ctx.db.pushSubscription.deleteMany({
		where: {
			userId: user.id,
			endpoint: input.endpoint,
		},
	});
};

export default authorizedProcedure
	.input(UnsubscribePushInputSchema)
	.mutation(handler);
