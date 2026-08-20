import type { User } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { db } from "~/server/db";
import { type Controller, authorizedProcedure } from "../../trpc";
import { hasTeamAccessMiddleware } from "../../util/auth";
import { getInvitedGroups, isUserInvited } from "../../util/invitees";

const inputSchema = z.object({
	eventId: z.string().min(1),
});

type InviteInfo = {
	/** Tom liste betyr at hele laget er invitert. */
	groups: { id: string; name: string }[];
	isInvited: boolean;
};

const handler: Controller<z.infer<typeof inputSchema>, InviteInfo> = async ({
	input,
	ctx,
}) => {
	const event = await db.teamEvent.findUnique({
		where: { id: input.eventId },
		select: { teamId: true },
	});

	if (!event) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: "Arrangement ikke funnet",
		});
	}

	await hasTeamAccessMiddleware(ctx.user as User, event.teamId, [
		"ADMIN",
		"SUBADMIN",
		"USER",
	]);

	const [groups, isInvited] = await Promise.all([
		getInvitedGroups(input.eventId),
		isUserInvited(input.eventId, ctx.user.id),
	]);

	return { groups, isInvited };
};

export default authorizedProcedure.input(inputSchema).query(handler);
