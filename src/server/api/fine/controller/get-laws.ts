import type { User } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import type z from "zod";
import { type PhotonLaw, getGroupLaws } from "~/actions";
import { photonFailureMessage } from "~/lib/photon";
import { GetFineLawsSchema } from "~/schemas";
import { type Controller, authorizedProcedure } from "~/server/api/trpc";
import { hasTeamAccessMiddleware } from "~/server/api/util/auth";

/**
 * Paragrafene i lovverket til lagets gruppe på tihlde.org. Et avslag fra
 * tihlde.org kastes ikke: dialogen kan fortsatt gi bøter uten paragraf, og
 * trenger bare å vise hvorfor lista er tom.
 */
const handler: Controller<
	z.infer<typeof GetFineLawsSchema>,
	{ ok: true; laws: PhotonLaw[] } | { ok: false; message: string }
> = async ({ input, ctx }) => {
	await hasTeamAccessMiddleware(ctx.user as User, input.teamId, [
		"ADMIN",
		"SUBADMIN",
	]);

	const team = await ctx.db.team.findUnique({
		where: { id: input.teamId },
		select: { slug: true },
	});

	if (!team) {
		throw new TRPCError({ code: "NOT_FOUND", message: "Laget finnes ikke." });
	}
	if (!team.slug) {
		return {
			ok: false,
			message: "Laget er ikke koblet til en gruppe på tihlde.org.",
		};
	}

	const result = await getGroupLaws(team.slug);
	if (!result.ok) return { ok: false, message: photonFailureMessage(result) };

	return { ok: true, laws: result.data };
};

export default authorizedProcedure.input(GetFineLawsSchema).query(handler);
