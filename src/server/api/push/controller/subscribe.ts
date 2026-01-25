import type { User } from "@prisma/client";
import type z from "zod";
import { PushSubscriptionInputSchema } from "~/schemas";
import { type Controller, authorizedProcedure } from "../../trpc";

const handler: Controller<
	z.infer<typeof PushSubscriptionInputSchema>,
	void
> = async ({ input, ctx }) => {
	const user = ctx.user as User;

	await ctx.db.pushSubscription.upsert({
		where: {
			endpoint: input.endpoint,
		},
		create: {
			userId: user.id,
			endpoint: input.endpoint,
			p256dh: input.keys.p256dh,
			auth: input.keys.auth,
		},
		update: {
			userId: user.id,
			p256dh: input.keys.p256dh,
			auth: input.keys.auth,
		},
	});
};

export default authorizedProcedure
	.input(PushSubscriptionInputSchema)
	.mutation(handler);
