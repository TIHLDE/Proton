import type { User } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { sendEmail } from "~/lib/email";
import { settingsUrl } from "~/lib/notify";
import { type Controller, authorizedProcedure } from "../../trpc";

const handler: Controller<void, { success: boolean }> = async ({ ctx }) => {
	const user = await ctx.db.user.findUniqueOrThrow({
		where: { id: (ctx.user as User).id },
		select: { email: true, emailNotificationsEnabled: true },
	});
	if (!user.emailNotificationsEnabled) {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "Aktiver e-postvarsler før du sender en test-e-post.",
		});
	}

	await sendEmail([user.email], "Test-varsel fra Sporty", [
		{ type: "title", content: "Test-varsel" },
		{ type: "text", content: "Dette er et test-varsel fra Sporty!" },
		{
			type: "button",
			text: "Endre e-postinnstillinger",
			url: settingsUrl,
		},
	]);

	return { success: true };
};

export default authorizedProcedure.mutation(handler);
