import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { genericOAuth } from "better-auth/plugins";
import { env } from "~/env";
import { db } from "~/server/db";

export const auth = betterAuth({
	secret: env.BETTER_AUTH_SECRET,
	database: prismaAdapter(db, {
		provider: "postgresql",
	}),
	// Passord logges inn med på tihlde.org, ikke her. Lepton skal avvikles, og
	// denne appen skal uansett ikke ta imot medlemmenes passord for å veksle
	// dem inn i et token et annet sted.
	emailAndPassword: {
		enabled: false,
	},
	session: {
		expiresIn: 60 * 60 * 24 * 120, // 120 days,
		updateAge: 60 * 60 * 24,
	},
	user: {
		additionalFields: {
			username: {
				type: "string",
				required: true,
				unique: true,
			},
			isAdmin: {
				type: "boolean",
				required: true,
				default: false,
			},
			calendarToken: {
				type: "string",
				required: false,
				unique: true,
			},
		},
	},
	trustedOrigins: ["*"],
	plugins: [
		genericOAuth({
			config: [
				{
					providerId: "photon",
					// Samme grunn som i actions/auth.ts: med SKIP_ENV_VALIDATION
					// uteblir skjemaets default, og «undefined» ville havnet
					// midt i URL-en.
					discoveryUrl: `${env.PHOTON_ISSUER ?? "https://photon.tihlde.org/api/auth"}/.well-known/openid-configuration`,
					// Valgfrie i env-skjemaet, som resten av variablene her, så
					// bygg uten dem ikke faller på validering. Mangler de i
					// runtime, avviser Photon autorisasjonen — det er synlig
					// med én gang og bare for innlogging.
					clientId: env.PHOTON_CLIENT_ID ?? "",
					clientSecret: env.PHOTON_CLIENT_SECRET ?? "",
					/**
					 * `offline_access` hører hjemme her: Photon kjører
					 * better-auth sin OIDC-provider, der access-tokens varer én
					 * time mens sesjonen her varer i 120 dager, og uten
					 * refresh-token utløper tilgangen etter den timen.
					 *
					 * Men Photon avviser scopet med «invalid_scope» og blokkerer
					 * dermed hele innloggingen. Discovery-dokumentet lister det
					 * under `scopes_supported`, men den lista er hardkodet i
					 * better-auth og sier ingenting om hva provideren godtar —
					 * valideringen skjer mot en egen liste hos Photon.
					 *
					 * Legges tilbake når Photon slipper det gjennom. Fram til da
					 * må brukeren koble til på nytt når timen er ute; knappen på
					 * /min-oversikt gjør det til ett klikk.
					 */
					scopes: ["openid", "profile", "email"],
					// Photon avviser autorisasjon uten PKCE, også for
					// konfidensielle klienter som denne: «pkce is required for
					// this client». better-auth har den av som standard.
					pkce: true,
					/**
					 * `username` er et påkrevd felt på brukeren her, men Photon
					 * har det ikke i standard-claimene. Uten dette faller
					 * opprettelsen av nye brukere på validering.
					 *
					 * E-postens lokaldel er samme verdi Lepton brukte som
					 * user_id for stud.ntnu.no-kontoer, så eksisterende rader
					 * kjenner seg igjen.
					 */
					// Typen til mapProfileToUser kjenner bare standardfeltene på
					// brukeren, ikke additionalFields, så username må castes inn.
					mapProfileToUser: (profile) =>
						({
							username:
								(profile.preferred_username as string | undefined) ??
								profile.email?.split("@")[0] ??
								profile.sub,
						}) as unknown as Record<string, never>,
				},
			],
		}),
		nextCookies(),
	],
});
