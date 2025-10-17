import { TRPCError } from "@trpc/server";
import type z from "zod";
import { DeleteEventInputSchema } from "~/schemas";
import { deleteEvent } from "~/services/event";
import { type Controller, authorizedProcedure } from "../../trpc";

const handler: Controller<
	z.infer<typeof DeleteEventInputSchema>,
	void
> = async ({ input, ctx }) => {
	// Check if user is admin
	if (!ctx.user?.isAdmin) {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "Du har ikke tilgang til å slette arrangementer.",
		});
	}

	await deleteEvent(input.id);
};

export default authorizedProcedure
	.input(DeleteEventInputSchema)
	.mutation(handler);
