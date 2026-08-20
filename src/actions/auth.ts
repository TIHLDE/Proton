"use server";

import { headers } from "next/headers";
import { env } from "~/env";
import { auth } from "~/lib/auth";

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
 * Brukere som logget inn før `offline_access` ble bedt om, har ikke noe
 * refresh-token på kontoen. Da kommer det utløpte tokenet uendret tilbake, og
 * eneste vei videre er å logge inn på nytt — derav «reauth».
 */
async function getPhotonAccessToken(): Promise<TokenResult> {
	const requestHeaders = await headers();
	const session = await auth.api.getSession({ headers: requestHeaders });
	if (!session?.user?.id) return { ok: false, reason: "no-session" };

	try {
		const tokens = await auth.api.getAccessToken({
			body: { providerId: "photon", userId: session.user.id },
			headers: requestHeaders,
		});

		if (!tokens?.accessToken) return { ok: false, reason: "reauth" };

		const expiresAt = tokens.accessTokenExpiresAt
			? new Date(tokens.accessTokenExpiresAt).getTime()
			: null;

		// Et utløpt token gir 401 uansett; å stoppe her lar kalleren si «logg
		// inn på nytt» framfor å vise en generisk feil.
		if (expiresAt !== null && expiresAt <= Date.now()) {
			return { ok: false, reason: "reauth" };
		}

		return { ok: true, token: tokens.accessToken };
	} catch {
		// Kastes blant annet når kontoen mangler, eller når fornyelsen ble
		// avvist av Photon. Begge løses av en ny innlogging.
		return { ok: false, reason: "reauth" };
	}
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
