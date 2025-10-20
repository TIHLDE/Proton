import type z from "zod";
import { deleteRegistrationSchema } from "~/schemas";
import { deleteRegistration } from "~/services";
import { type Controller, authorizedProcedure } from "../../trpc";

const handler: Controller<
	z.infer<typeof deleteRegistrationSchema>,
	void
> = async ({ input, ctx }) => {
	await deleteRegistration(input.id, ctx.user.id);
};

export default authorizedProcedure
	.input(deleteRegistrationSchema)
	.mutation(handler);
