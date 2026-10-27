import { Prisma, type User } from "@prisma/client";
import type z from "zod";
import { createGroupFine } from "~/actions";
import { photonFailureMessage, sendFinesToTihlde } from "~/lib/photon";
import { ApplyCourtRuleSchema } from "~/schemas";
import { type Controller, authorizedProcedure } from "~/server/api/trpc";
import { hasTeamAccessMiddleware } from "~/server/api/util/auth";
import { computeCourt, courtReason } from "../court";

type Outcome = { name: string; message: string };

/** Gir bøtene fra én rettsak-regel til de valgte. */
const handler: Controller<
	z.infer<typeof ApplyCourtRuleSchema>,
	{
		given: string[];
		skipped: Outcome[];
		failed: Outcome[];
		sentToTihlde: boolean;
	}
> = async ({ input, ctx }) => {
	await hasTeamAccessMiddleware(ctx.user as User, input.teamId, [
		"ADMIN",
		"SUBADMIN",
	]);

	// Regnes ut på nytt her, ikke hos klienten: noen kan ha gitt eller fått
	// bøter siden forhåndsvisningen ble hentet.
	const court = await computeCourt(input.teamId);
	const selected = new Set(input.userIds);
	const key = input.rule === "SNITCH" ? "snitch" : "goodBoy";

	const given: string[] = [];
	const skipped: Outcome[] = [];
	const failed: Outcome[] = [];
	let reauthRequired = false;

	// Ett og ett, ikke parallelt: tokenet kan fornyes underveis, og Photon
	// regner andre gangs bruk av samme refresh-token som tyveri.
	for (const member of court.members) {
		if (!selected.has(member.userId)) continue;

		const quantity = member[key];
		if (quantity === 0) {
			skipped.push({ name: member.name, message: "regelen gjelder ikke" });
			continue;
		}
		if (member.skipReason || !member.tihldeUserId) {
			skipped.push({
				name: member.name,
				message: member.skipReason ?? "ikke koblet til TIHLDE",
			});
			continue;
		}
		if (reauthRequired) {
			failed.push({
				name: member.name,
				message: "logg inn med TIHLDE på nytt",
			});
			continue;
		}

		// Den unike nøkkelen (teamId, since, rule, userId) er låsen: et
		// dobbeltklikk eller to admins samtidig kan ikke gi samme regel to ganger.
		const record = await ctx.db.courtFine
			.create({
				data: {
					teamId: input.teamId,
					since: court.since,
					rule: input.rule,
					userId: member.userId,
					issuedById: ctx.user.id,
					quantity,
				},
			})
			.catch((error: unknown) => {
				if (
					error instanceof Prisma.PrismaClientKnownRequestError &&
					error.code === "P2002"
				) {
					return null;
				}
				throw error;
			});

		if (!record) {
			skipped.push({ name: member.name, message: "har allerede fått" });
			continue;
		}

		if (!sendFinesToTihlde) {
			given.push(member.name);
			continue;
		}

		const result = await createGroupFine(court.groupSlug, {
			userId: member.tihldeUserId,
			amount: quantity,
			reason: courtReason(input.rule, member, court.since),
		});

		if (!result.ok) {
			// Uten boten på tihlde.org skal ikke låsen stå igjen, ellers kan
			// personen aldri få den.
			await ctx.db.courtFine.delete({ where: { id: record.id } });
			if (result.reason === "reauth") reauthRequired = true;
			failed.push({ name: member.name, message: photonFailureMessage(result) });
			continue;
		}

		await ctx.db.courtFine.update({
			where: { id: record.id },
			data: { photonFineId: result.data.id },
		});
		given.push(member.name);
	}

	return { given, skipped, failed, sentToTihlde: sendFinesToTihlde };
};

export default authorizedProcedure
	.input(ApplyCourtRuleSchema)
	.mutation(handler);
