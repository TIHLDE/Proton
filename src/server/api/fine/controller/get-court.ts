import type { User } from "@prisma/client";
import type z from "zod";
import { GetCourtSchema } from "~/schemas";
import { type Controller, authorizedProcedure } from "~/server/api/trpc";
import { hasTeamAccessMiddleware } from "~/server/api/util/auth";
import { type CourtMember, computeCourt } from "../court";

/** Forhåndsvisning av rettsak-reglene: hvem som ville fått hva nå. */
const handler: Controller<
	z.infer<typeof GetCourtSchema>,
	{ since: Date; members: Omit<CourtMember, "tihldeUserId">[] }
> = async ({ input, ctx }) => {
	await hasTeamAccessMiddleware(ctx.user as User, input.teamId, [
		"ADMIN",
		"SUBADMIN",
	]);

	const { since, members } = await computeCourt(input.teamId);

	return {
		since,
		members: members.map(({ tihldeUserId: _, ...member }) => member),
	};
};

export default authorizedProcedure.input(GetCourtSchema).query(handler);
