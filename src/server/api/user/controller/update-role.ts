import type z from "zod";
import { env } from "~/env";
import { sendEmail } from "~/lib/email";
import { UpdateUserRoleInputSchema } from "~/schemas";
import { type Controller, adminProcedure } from "../../trpc";

const handler: Controller<
	z.infer<typeof UpdateUserRoleInputSchema>,
	void
> = async ({ input, ctx }) => {
	const user = await ctx.db.user.update({
		where: { id: input.userId },
		data: { isAdmin: input.isAdmin },
	});

	if (input.isAdmin) {
		await sendEmail([user.email], "Du har blitt superadmin", [
			{
				type: "title",
				content: "Gratulerer! Du er nå superadmin",
			},
			{
				type: "text",
				content:
					"Du har fått superadmin-tilgang på Sporty. Dette gir deg tilgang til alle funksjoner og innstillinger i systemet.",
			},
			{
				type: "button",
				text: "Gå til admin-panelet",
				url: `${env.NEXT_PUBLIC_URL}/admin`,
			},
		]);
	}
};

export default adminProcedure
	.input(UpdateUserRoleInputSchema)
	.mutation(handler);
