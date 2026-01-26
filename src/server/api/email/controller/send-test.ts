import type { User } from "@prisma/client";
import { sendEmail } from "~/lib/email";
import { type Controller, authorizedProcedure } from "../../trpc";

const handler: Controller<void, { success: boolean }> = async ({ ctx }) => {
	const user = ctx.user as User;

	await sendEmail([user.email], "Test-varsel fra Sporty", [
		{ type: "title", content: "Test-varsel" },
		{ type: "text", content: "Dette er et test-varsel fra Sporty!" },
		{
			type: "button",
			text: "Gå til innstillinger",
			url: "https://sporty.tihlde.org/min-oversikt/innstillinger",
		},
	]);

	return { success: true };
};

export default authorizedProcedure.mutation(handler);
