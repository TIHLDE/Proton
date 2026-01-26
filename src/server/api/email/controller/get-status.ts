import type { User } from "@prisma/client";
import { type Controller, authorizedProcedure } from "../../trpc";

const handler: Controller<
	void,
	{ emailNotificationsEnabled: boolean }
> = async ({ ctx }) => {
	const user = ctx.user as User;

	const userData = await ctx.db.user.findUnique({
		where: {
			id: user.id,
		},
		select: {
			emailNotificationsEnabled: true,
		},
	});

	return {
		emailNotificationsEnabled: userData?.emailNotificationsEnabled ?? true,
	};
};

export default authorizedProcedure.query(handler);
