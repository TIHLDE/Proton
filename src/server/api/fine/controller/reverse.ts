import type { User } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import type z from "zod";
import { ReverseFineInputSchema } from "~/schemas";
import { db } from "~/server/db";
import { type Controller, authorizedProcedure } from "../../trpc";
import { hasTeamAccessMiddleware } from "../../util/auth";

const handler: Controller<
	z.infer<typeof ReverseFineInputSchema>,
	void
> = async ({ input, ctx }) => {
	const fine = await db.fine.findUnique({
		where: { id: input.fineId },
	});

	if (!fine) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: "Boten finnes ikke.",
		});
	}

	// teamId leses fra boten selv, aldri fra klienten - en admin i ett lag
	// skal ikke kunne reversere en bot i et annet ved å gjette en id.
	await hasTeamAccessMiddleware(ctx.user as User, fine.teamId, [
		"ADMIN",
		"SUBADMIN",
	]);

	if (fine.reversed) {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: "Boten er allerede reversert.",
		});
	}

	await db.fine.update({
		where: { id: input.fineId },
		data: {
			reversed: true,
			reversedByUserId: ctx.user.id,
			reversedAt: new Date(),
		},
	});
};

export default authorizedProcedure
	.input(ReverseFineInputSchema)
	.mutation(handler);
