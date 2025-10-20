import type { User } from "@prisma/client";
import type z from "zod";
import { createRegistrationSchema } from "~/schemas";
import { createRegistration } from "~/services";
import { type Controller, authorizedProcedure } from "../../trpc";

const handler: Controller<
	z.infer<typeof createRegistrationSchema>,
	void
> = async ({ input, ctx }) => {
	await createRegistration(
		ctx.user.id,
		input.eventId,
		input.type,
		input.comment,
	);
};

export default authorizedProcedure
	.input(createRegistrationSchema)
	.mutation(handler);
