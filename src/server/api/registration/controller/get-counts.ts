import type z from "zod";
import { getRegistrationByEventSchema } from "~/schemas";
import { getRegistrationCountsByEvent } from "~/services";
import { type Controller, authorizedProcedure } from "../../trpc";

const handler: Controller<
	z.infer<typeof getRegistrationByEventSchema>,
	any
> = async ({ input }) => {
	return await getRegistrationCountsByEvent(input.eventId);
};

export default authorizedProcedure
	.input(getRegistrationByEventSchema)
	.query(handler);
