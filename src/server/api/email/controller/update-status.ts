import type { User } from "@prisma/client";
import { z } from "zod";
import { type Controller, authorizedProcedure } from "../../trpc";

const EmailStatusInputSchema = z.object({
	emailNotificationsEnabled: z.boolean(),
	disabledEmailNotifications: z
		.object({
			newEvent: z.literal(true).optional(),
			unansweredEvent: z.literal(true).optional(),
		})
		.strict(),
});

const handler: Controller<
	z.infer<typeof EmailStatusInputSchema>,
	void
> = async ({ input, ctx }) => {
	const user = ctx.user as User;

	await ctx.db.user.update({
		where: { id: user.id },
		data: input,
	});
};

export default authorizedProcedure
	.input(EmailStatusInputSchema)
	.mutation(handler);
