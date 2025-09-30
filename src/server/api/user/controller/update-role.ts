import type z from "zod";
import { UpdateUserRoleInputSchema } from "~/schemas";
import { type Controller, adminProcedure } from "../../trpc";

const handler: Controller<
	z.infer<typeof UpdateUserRoleInputSchema>,
	void
> = async ({ input, ctx }) => {
	await ctx.db.user.update({
		where: { id: input.userId },
		data: { isAdmin: input.isAdmin },
	});
};

export default adminProcedure
	.input(UpdateUserRoleInputSchema)
	.mutation(handler);
