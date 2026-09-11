import type { User } from "@prisma/client";
import type { DisabledEmailNotifications } from "~/lib/notify";
import { type Controller, authorizedProcedure } from "../../trpc";

const handler: Controller<
	void,
	{
		emailNotificationsEnabled: boolean;
		disabledEmailNotifications: DisabledEmailNotifications;
	}
> = async ({ ctx }) => {
	const user = ctx.user as User;
	const userData = await ctx.db.user.findUnique({
		where: { id: user.id },
		select: {
			emailNotificationsEnabled: true,
			disabledEmailNotifications: true,
		},
	});
	const disabled = userData?.disabledEmailNotifications;

	return {
		emailNotificationsEnabled: userData?.emailNotificationsEnabled ?? true,
		disabledEmailNotifications:
			typeof disabled === "object" && disabled !== null
				? (disabled as DisabledEmailNotifications)
				: {},
	};
};

export default authorizedProcedure.query(handler);
