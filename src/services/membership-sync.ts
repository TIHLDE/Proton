"use server";

import type { TeamRole } from "@prisma/client";
import { getUserMemberships } from "~/actions";
import { db } from "~/server/db";

/**
 * Hvor lenge en synk regnes som fersk. Uten dette ville hvert sidebesøk gitt
 * et kall mot Photon, og gruppemedlemskap endrer seg ikke fra minutt til
 * minutt.
 */
const SYNC_TTL_MS = 15 * 60 * 1000;

export type SyncResult =
	| { ok: true; skipped: boolean }
	| { ok: false; reason: "no-session" }
	| { ok: false; reason: "reauth" }
	| { ok: false; reason: "photon-error"; status: number };

/**
 * Speiler brukerens Photon-grupper over i TeamMember-radene.
 *
 * Bare lag som allerede finnes her berøres — Photon-grupper uten et tilsvarende
 * lag hoppes over, og medlemskap i lag brukeren har meldt seg ut av i Photon
 * fjernes ikke automatisk.
 *
 * Photon bestemmer *om* noen er medlem, ikke *hvilken rolle* de har. Rollen
 * settes bare når raden opprettes; etterpå eier laget den selv. Uten det skrev
 * synken over hver rolleendring en lagadmin gjorde: Photon kjenner bare
 * leader/ikke-leder, så SUBADMIN — som ikke finnes der — ble degradert til
 * USER ved neste synk, og det samme skjedde med enhver ADMIN som ikke tilfeldig
 * var gruppeleder i Photon. Siden synken kjører ved besøk på /min-oversikt og
 * er fersk i 15 minutter, hoppet rollene tilbake i løpet av kvarteret.
 *
 * Det speiler regelen over: mister du gruppa i Photon, mister du ikke
 * medlemskapet her heller. Baksiden er at den som blir gruppeleder i Photon i
 * ettertid ikke forfremmes automatisk — en lagadmin må sette rollen. Det er
 * uansett den eneste veien inn i SUBADMIN, så rolleadministrasjonen er samlet
 * ett sted i stedet for å være delt mellom Photon og Proton.
 */
export async function syncTeamMemberships(userId: string): Promise<SyncResult> {
	const result = await getUserMemberships();

	if (!result.ok) return result;

	// Photon nøster medlemskapet inni gruppa, motsatt av Lepton. En gruppe
	// uten membership skal ikke gi ADMIN ved et uhell, så den hoppes over.
	const memberships = result.memberships
		.filter((group) => group.membership !== null)
		.map((group) => ({
			groupSlug: group.slug,
			role: (group.membership?.role === "leader"
				? "ADMIN"
				: "USER") as TeamRole,
		}));

	const existingTeams = await db.team.findMany({
		where: {
			slug: { in: memberships.map((membership) => membership.groupSlug) },
		},
	});

	await Promise.all(
		memberships.map(async (membership) => {
			const team = existingTeams.find(
				(team) => team.slug === membership.groupSlug,
			);

			if (!team) return;

			const existingMembership = await db.teamMember.findFirst({
				where: { userId, teamId: team.id },
			});

			// Raden finnes: la rollen stå. Den er lagets, ikke Photons.
			if (existingMembership) return;

			await db.teamMember.create({
				data: { userId, teamId: team.id, role: membership.role },
			});
		}),
	);

	await db.user.update({
		where: { id: userId },
		data: { membershipsSyncedAt: new Date() },
	});

	return { ok: true, skipped: false };
}

/**
 * Samme som over, men hopper over kallet mot Photon når forrige synk er fersk.
 * Dette er inngangen sider bruker; `syncTeamMemberships` er den som alltid
 * kjører, for når brukeren ber om det eksplisitt.
 */
export async function syncTeamMembershipsIfStale(
	userId: string,
): Promise<SyncResult> {
	const user = await db.user.findUnique({
		where: { id: userId },
		select: { membershipsSyncedAt: true },
	});

	const lastSync = user?.membershipsSyncedAt?.getTime() ?? 0;
	if (Date.now() - lastSync < SYNC_TTL_MS) {
		return { ok: true, skipped: true };
	}

	return syncTeamMemberships(userId);
}
