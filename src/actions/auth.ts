"use server";

import { headers } from "next/headers";
import { env } from "~/env";
import { auth } from "~/lib/auth";
import { db } from "~/server/db";

/**
 * Standardverdien gjentas her med vilje. `SKIP_ENV_VALIDATION` gjør at t3-env
 * returnerer process.env rått, uten skjemaets default — og siden dette leses
 * på modulnivå, ville `.replace` på undefined felt hele bygget når Next samler
 * sidedata.
 */
const ISSUER = env.PHOTON_ISSUER ?? "https://photon.tihlde.org/api/auth";
const API_URL = ISSUER.replace(/\/auth$/, "");

/** Taket for hvor lenge en sidelasting kan vente på Photon. */
const PHOTON_TIMEOUT_MS = 5000;

/** Se `tokenUrlParams` i ~/lib/auth.ts for hvorfor denne må være med. */
const PHOTON_AUDIENCE = ISSUER;
const TOKEN_ENDPOINT = `${ISSUER}/oauth2/token`;

/**
 * Fornyelser underveis, nøklet på refresh-tokenet som brukes.
 *
 * Photon roterer refresh-tokens og regner andre gangs bruk av samme token som
 * tyveri: hele kjeden droppes og brukeren blir logget ut. To faner som lastes
 * samtidig ville ellers kappes om det, og den andre ville sett ut som et
 * stjålet token.
 */
const inFlight = new Map<string, Promise<string | null>>();

export type PhotonMembership = {
	slug: string;
	name: string;
	membership: { role: "member" | "leader" } | null;
};

/**
 * Hvorfor et kall mot Photon ikke gikk. Kallerne trenger å skille disse:
 * «logg inn på nytt» og «Photon er nede» krever helt ulik handling av brukeren.
 */
export type PhotonFailure =
	| { ok: false; reason: "no-session" }
	| { ok: false; reason: "reauth" }
	| { ok: false; reason: "photon-error"; status: number };

export type PhotonMembershipsResult =
	| { ok: true; memberships: PhotonMembership[] }
	| PhotonFailure;

type TokenResult = { ok: true; token: string } | PhotonFailure;

/**
 * Access-tokenet better-auth lagret da brukeren logget inn via Photon.
 *
 * Hentes via `getAccessToken` framfor å lese account-raden direkte: Photon
 * kjører better-auth sin OIDC-provider, som gir access-tokens med én times
 * levetid, mens sesjonen her varer i 120 dager. Å lese raden rått betyr derfor
 * at alt utenom den første timen etter innlogging feiler. `getAccessToken`
 * fornyer tokenet med refresh-tokenet når det er utløpt.
 *
 * Brukere som sist logget inn før `offline_access` kom på plass, har ikke noe
 * refresh-token på kontoen. Da kommer det utløpte tokenet uendret tilbake, og
 * eneste vei videre er å logge inn på nytt — derav «reauth».
 */
async function getPhotonAccessToken(): Promise<TokenResult> {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user?.id) return { ok: false, reason: "no-session" };

	const account = await db.account.findFirst({
		where: { userId: session.user.id, providerId: "photon" },
		select: {
			id: true,
			accessToken: true,
			refreshToken: true,
			accessTokenExpiresAt: true,
		},
	});

	if (!account?.accessToken) return { ok: false, reason: "reauth" };

	// Fem sekunders margin: et token som utløper mens kallet er i lufta er like
	// ubrukelig som et utløpt et.
	const expiresAt = account.accessTokenExpiresAt?.getTime() ?? null;
	if (expiresAt === null || expiresAt - Date.now() > 5000) {
		return { ok: true, token: account.accessToken };
	}

	// Brukere som sist logget inn før `offline_access` kom på plass, har ikke
	// noe refresh-token. Eneste vei videre er en ny innlogging.
	if (!account.refreshToken) return { ok: false, reason: "reauth" };

	const refreshed = await refreshPhotonToken(account.id, account.refreshToken);
	if (!refreshed) return { ok: false, reason: "reauth" };

	return { ok: true, token: refreshed };
}

/**
 * Veksler refresh-tokenet inn i et nytt access-token, og lagrer begge.
 *
 * Gjøres for hånd fordi better-auth sin `genericOAuth` ikke sender
 * `tokenUrlParams` videre ved fornyelse. Uten `resource` her ville Photon svart
 * med et opakt token, og alle kall mot API-et deres ville gitt 401 — samme felle
 * som ved innlogging, bare en time forsinket.
 */
async function refreshPhotonToken(
	accountId: string,
	refreshToken: string,
): Promise<string | null> {
	const existing = inFlight.get(refreshToken);
	if (existing) return existing;

	const request = performRefresh(accountId, refreshToken).finally(() => {
		inFlight.delete(refreshToken);
	});

	inFlight.set(refreshToken, request);
	return request;
}

async function performRefresh(
	accountId: string,
	refreshToken: string,
): Promise<string | null> {
	const clientId = env.PHOTON_CLIENT_ID;
	const clientSecret = env.PHOTON_CLIENT_SECRET;
	if (!clientId || !clientSecret) return null;

	let response: Response;
	try {
		response = await fetch(TOKEN_ENDPOINT, {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
			},
			body: new URLSearchParams({
				grant_type: "refresh_token",
				refresh_token: refreshToken,
				client_id: clientId,
				// Audiencen avgjøres per utstedelse, så den må sendes på nytt
				// her — en fornyelse uten den gir et opakt token tilbake.
				resource: PHOTON_AUDIENCE,
			}),
			cache: "no-store",
			signal: AbortSignal.timeout(PHOTON_TIMEOUT_MS),
		});
	} catch {
		return null;
	}

	if (!response.ok) return null;

	const data = (await response.json()) as {
		access_token?: string;
		refresh_token?: string;
		expires_in?: number;
	};

	if (!data.access_token) return null;

	await db.account.update({
		where: { id: accountId },
		data: {
			accessToken: data.access_token,
			// Photon roterer refresh-tokenet. Faller vi tilbake på det gamle,
			// er det brukt opp, og neste fornyelse ville sett ut som tyveri.
			refreshToken: data.refresh_token ?? refreshToken,
			accessTokenExpiresAt: data.expires_in
				? new Date(Date.now() + data.expires_in * 1000)
				: null,
		},
	});

	return data.access_token;
}

/**
 * Gruppene brukeren er medlem av, hentet fra Photon.
 *
 * Erstatter Leptons /users/me/memberships/. Formen er snudd: Photon returnerer
 * gruppene med medlemskapet nøstet inni, der Lepton returnerte medlemskap med
 * gruppa nøstet inni.
 */
export async function getUserMemberships(): Promise<PhotonMembershipsResult> {
	const token = await getPhotonAccessToken();
	if (!token.ok) return token;

	// Kallet skjer under rendringen av /min-oversikt, så en treg Photon ville
	// holdt sida igjen. Etter timeout vises heller listen vi har fra før,
	// sammen med et varsel om at den kan være utdatert.
	let response: Response;
	try {
		response = await fetch(`${API_URL}/groups/mine`, {
			headers: { Authorization: `Bearer ${token.token}` },
			cache: "no-store",
			signal: AbortSignal.timeout(PHOTON_TIMEOUT_MS),
		});
	} catch {
		return { ok: false, reason: "photon-error", status: 408 };
	}

	// 401 fra Photon betyr at tokenet ikke lenger godtas, uansett hva
	// utløpstiden på kontoraden vår sier.
	if (response.status === 401) return { ok: false, reason: "reauth" };

	if (!response.ok) {
		return { ok: false, reason: "photon-error", status: response.status };
	}

	return {
		ok: true,
		memberships: (await response.json()) as PhotonMembership[],
	};
}
