import type { User } from "@prisma/client";
import { sendPushNotification } from "~/lib/push";
import { type Controller, authorizedProcedure } from "../../trpc";

const handler: Controller<void, { success: boolean }> = async ({ ctx }) => {
	const user = ctx.user as User;

	await sendPushNotification([user.id], {
		title: "Test-varsel",
		body: "Dette er et test-varsel fra Sporty!",
		url: "/min-oversikt/innstillinger",
	});

	return { success: true };
};

export default authorizedProcedure.mutation(handler);
