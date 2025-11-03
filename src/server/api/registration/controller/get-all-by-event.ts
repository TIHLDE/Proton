import type z from "zod";
import { getRegistrationByEventSchema } from "~/schemas";
import { getRegistrationsByEvent } from "~/services";
import { type Controller, authorizedProcedure } from "../../trpc";

const handler: Controller<
	z.infer<typeof getRegistrationByEventSchema>,
	any
> = async ({ input }) => {
	return await getRegistrationsByEvent(input.eventId);
};

export default authorizedProcedure
	.input(getRegistrationByEventSchema)
	.query(handler);
