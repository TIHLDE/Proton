import { TRPCError } from "@trpc/server";
import type z from "zod";
import { CreateEventInputSchema } from "~/schemas";
import { createEvent } from "~/services/event";
import { type Controller, authorizedProcedure } from "../../trpc";

const handler: Controller<
	z.infer<typeof CreateEventInputSchema>,
	void
> = async ({ input, ctx }) => {
	// Check if user is admin
	if (!ctx.user?.isAdmin) {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "Du har ikke tilgang til å opprette arrangementer.",
		});
	}

	await createEvent({
		teamId: input.teamId,
		name: input.name,
		datetime: input.datetime,
		type: input.type,
		location: input.location,
		note: input.note,
	});
};

export default authorizedProcedure
	.input(CreateEventInputSchema)
	.mutation(handler);
