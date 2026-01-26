import type z from "zod";
import { env } from "~/env";
import { sendNotification } from "~/lib/notify";
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
		void sendNotification({
			userIds: [user.id],
			emails: [user.email],
			subject: "Du har blitt superadmin",
			emailContent: [
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
			],
			pushPayload: {
				title: "Du har blitt superadmin",
				body: "Du har fått superadmin-tilgang på Sporty.",
				url: `${env.NEXT_PUBLIC_URL}/admin`,
			},
		});
	}
};

export default adminProcedure
	.input(UpdateUserRoleInputSchema)
	.mutation(handler);
