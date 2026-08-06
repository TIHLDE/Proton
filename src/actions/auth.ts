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

export type PhotonMembership = {
	slug: string;
	name: string;
	membership: { role: "member" | "leader" } | null;
};

/**
 * Access-tokenet better-auth lagret da brukeren logget inn via Photon.
 *
 * Tokenet ligger på account-raden, ikke i en egen cookie som før: OAuth-flyten
 * eier det, og å speile det ut i en cookie ville gitt to kilder som kommer i
 * utakt når det fornyes.
 */
async function getPhotonAccessToken(): Promise<string | null> {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user?.id) return null;

	const account = await db.account.findFirst({
		where: { userId: session.user.id, providerId: "photon" },
		select: { accessToken: true, accessTokenExpiresAt: true },
	});

	if (!account?.accessToken) return null;

	// Et utløpt token gir 401 uansett; å returnere null her lar kalleren si
	// «logg inn på nytt» framfor å vise en generisk feil.
	if (
		account.accessTokenExpiresAt &&
		account.accessTokenExpiresAt.getTime() <= Date.now()
	) {
		return null;
	}

	return account.accessToken;
}

/**
 * Gruppene brukeren er medlem av, hentet fra Photon.
 *
 * Erstatter Leptons /users/me/memberships/. Formen er snudd: Photon returnerer
 * gruppene med medlemskapet nøstet inni, der Lepton returnerte medlemskap med
 * gruppa nøstet inni.
 */
export async function getUserMemberships(): Promise<PhotonMembership[] | null> {
	const token = await getPhotonAccessToken();
	if (!token) return null;

	const response = await fetch(`${API_URL}/groups/mine`, {
		headers: { Authorization: `Bearer ${token}` },
		cache: "no-store",
	});

	if (!response.ok) return null;

	return (await response.json()) as PhotonMembership[];
}
