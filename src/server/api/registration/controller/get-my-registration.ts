import type { User } from "@prisma/client";
import type z from "zod";
import { getRegistrationByEventSchema } from "~/schemas";
import { getRegistrationByUserAndEvent } from "~/services";
import { type Controller, authorizedProcedure } from "../../trpc";

const handler: Controller<
	z.infer<typeof getRegistrationByEventSchema>,
	any
> = async ({ input, ctx }) => {
	return await getRegistrationByUserAndEvent(ctx.user.id, input.eventId);
};

export default authorizedProcedure
	.input(getRegistrationByEventSchema)
	.query(handler);
