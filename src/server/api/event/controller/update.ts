import { TRPCError } from "@trpc/server";
import type z from "zod";
import { UpdateEventInputSchema } from "~/schemas";
import { updateEvent } from "~/services/event";
import { type Controller, authorizedProcedure } from "../../trpc";

const handler: Controller<
	z.infer<typeof UpdateEventInputSchema>,
	void
> = async ({ input, ctx }) => {
	// Check if user is admin
	if (!ctx.user?.isAdmin) {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "Du har ikke tilgang til å oppdatere arrangementer.",
		});
	}

	await updateEvent(input.id, {
		name: input.name,
		datetime: input.datetime,
		type: input.type,
		location: input.location,
		note: input.note,
	});
};

export default authorizedProcedure
	.input(UpdateEventInputSchema)
	.mutation(handler);
