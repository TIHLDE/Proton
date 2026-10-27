import type { CourtRule } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { getGroupFines } from "~/actions";
import { appZoneDate, formatInAppZone } from "~/lib/datetime";
import { photonFailureMessage } from "~/lib/photon";
import { db } from "~/server/db";

/** Antallet bøter begge rettsak-reglene dreier seg om. */
export const COURT_TARGET = 8;

/** Siste rettsak før datoen ble lagret per lag. */
export const DEFAULT_LAST_COURT = appZoneDate(2026, 3, 13);

export type CourtMember = {
	userId: string;
	name: string;
	/** Bøter personen har gitt siden sist rettsak. */
	given: number;
	/** Bøter personen har fått siden sist rettsak, uten rettsak-bøtene. */
	received: number;
	/** Hvor mange hver regel ville gitt nå. */
	snitch: number;
	goodBoy: number;
	/** Hvor mange personen allerede har fått fra hver regel denne perioden. */
	applied: { snitch: number | null; goodBoy: number | null };
	/** Hvorfor personen ikke kan få bot herfra, om noe. */
	skipReason: string | null;
	/** Brukerens id på tihlde.org. */
	tihldeUserId: string | null;
};

export type Court = {
	since: Date;
	groupSlug: string;
	members: CourtMember[];
};

export function courtReason(rule: CourtRule, member: CourtMember, since: Date) {
	const date = formatInAppZone(since, "dd.MM.yyyy");
	if (rule === "SNITCH") {
		return `Snitches don't get stitches: ingen bøter gitt siden ${date}`;
	}
	return `Snill gutt-syndrom: ${member.received} bøter siden ${date}, fylt opp til ${COURT_TARGET}`;
}

/**
 * Regner ut begge rettsak-reglene for laget ut fra bøtene på tihlde.org siden
 * sist rettsak.
 *
 * Reglene er uavhengige og regnes ut fra bøtene før noen av dem ble kjørt, så
 * rekkefølgen spiller ingen rolle. Avviste bøter teller ikke,
 * og motposter trekker fra.
 */
export async function computeCourt(teamId: string): Promise<Court> {
	const team = await db.team.findUnique({
		where: { id: teamId },
		select: { slug: true, lastCourtAt: true },
	});

	if (!team) {
		throw new TRPCError({ code: "NOT_FOUND", message: "Laget finnes ikke." });
	}
	if (!team.slug) {
		throw new TRPCError({
			code: "PRECONDITION_FAILED",
			message: "Laget er ikke koblet til en gruppe på tihlde.org.",
		});
	}

	const since = team.lastCourtAt ?? DEFAULT_LAST_COURT;

	const [members, courtFines, finesResult] = await Promise.all([
		db.teamMember.findMany({
			where: { teamId },
			orderBy: { user: { name: "asc" } },
			select: {
				inactiveSince: true,
				user: {
					select: {
						id: true,
						name: true,
						// accountId er brukerens id på tihlde.org, og det er den
						// Photon kjenner mottakeren og giveren igjen på.
						accounts: {
							where: { providerId: "photon" },
							select: { accountId: true },
						},
					},
				},
			},
		}),
		db.courtFine.findMany({
			where: { teamId, since },
			select: { userId: true, rule: true, quantity: true, photonFineId: true },
		}),
		getGroupFines(team.slug, since),
	]);

	if (!finesResult.ok) {
		throw new TRPCError({
			code: "BAD_GATEWAY",
			message: photonFailureMessage(finesResult),
		});
	}

	// Bøtene reglene selv har gitt, holdes utenfor begge tellingene. Ellers
	// ville den som kjørte Snitches telt som en som har gitt bot, og Snill
	// gutt ville sett Snitches-bøtene — og tallene ville endret seg etter
	// hver kjøring.
	const courtFineIds = new Set(
		courtFines.flatMap((fine) =>
			fine.photonFineId ? [fine.photonFineId] : [],
		),
	);

	const given = new Map<string, number>();
	const received = new Map<string, number>();
	for (const fine of finesResult.data) {
		if (fine.status === "rejected" || courtFineIds.has(fine.id)) continue;
		if (fine.createdByUserId) {
			given.set(
				fine.createdByUserId,
				(given.get(fine.createdByUserId) ?? 0) + 1,
			);
		}
		received.set(fine.userId, (received.get(fine.userId) ?? 0) + fine.amount);
	}

	const appliedQuantity = (userId: string, rule: CourtRule) =>
		courtFines.find((fine) => fine.userId === userId && fine.rule === rule)
			?.quantity ?? null;

	return {
		since,
		groupSlug: team.slug,
		members: members.map(({ user, inactiveSince }) => {
			const tihldeUserId = user.accounts[0]?.accountId ?? null;
			const givenCount = tihldeUserId ? (given.get(tihldeUserId) ?? 0) : 0;
			const receivedSum = tihldeUserId ? (received.get(tihldeUserId) ?? 0) : 0;

			return {
				userId: user.id,
				name: user.name,
				given: givenCount,
				received: receivedSum,
				snitch: givenCount === 0 ? COURT_TARGET : 0,
				goodBoy: Math.max(0, COURT_TARGET - receivedSum),
				applied: {
					snitch: appliedQuantity(user.id, "SNITCH"),
					goodBoy: appliedQuantity(user.id, "GOOD_BOY"),
				},
				skipReason:
					inactiveSince !== null
						? "inaktiv"
						: !tihldeUserId
							? "ikke koblet til TIHLDE"
							: null,
				tihldeUserId,
			};
		}),
	};
}
