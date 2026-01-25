import type { User } from "@prisma/client";
import { type Controller, authorizedProcedure } from "../../trpc";

const handler: Controller<void, { subscriptionCount: number }> = async ({
	ctx,
}) => {
	const user = ctx.user as User;

	const count = await ctx.db.pushSubscription.count({
		where: {
			userId: user.id,
		},
	});

	return { subscriptionCount: count };
};

export default authorizedProcedure.query(handler);
