import type { User } from "@prisma/client";
import type z from "zod";
import { appZoneDate } from "~/lib/datetime";
import { SetLastCourtDateSchema } from "~/schemas";
import { type Controller, authorizedProcedure } from "~/server/api/trpc";
import { hasTeamAccessMiddleware } from "~/server/api/util/auth";

/**
 * Setter datoen for siste rettsak. En ny dato er en ny periode, så låsene fra
 * forrige runde gjelder ikke lenger.
 */
const handler: Controller<
	z.infer<typeof SetLastCourtDateSchema>,
	{ since: Date }
> = async ({ input, ctx }) => {
	await hasTeamAccessMiddleware(ctx.user as User, input.teamId, [
		"ADMIN",
		"SUBADMIN",
	]);

	const [year, month, day] = input.date.split("-").map(Number) as [
		number,
		number,
		number,
	];
	const since = appZoneDate(year, month - 1, day);

	await ctx.db.team.update({
		where: { id: input.teamId },
		data: { lastCourtAt: since },
	});

	return { since };
};

export default authorizedProcedure
	.input(SetLastCourtDateSchema)
	.mutation(handler);
