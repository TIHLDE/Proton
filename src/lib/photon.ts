import type { PhotonFailure } from "~/actions";

/** Adressen til gruppas bøter på tihlde.org. */
export function tihldeFinesUrl(groupSlug: string) {
	return `https://tihlde.org/grupper/${encodeURIComponent(groupSlug)}?tab=boter`;
}

/** Forklaring til brukeren på hvorfor et kall mot tihlde.org ikke gikk. */
export function photonFailureMessage(failure: PhotonFailure) {
	switch (failure.reason) {
		case "no-session":
			return "Du er ikke logget inn.";
		case "reauth":
			return "Logg ut og inn igjen med TIHLDE for å gi bøter på tihlde.org.";
		case "photon-error":
			if (failure.status === 403) {
				return "Du er ikke medlem av gruppa på tihlde.org, så du kan ikke gi bøter der.";
			}
			if (failure.status === 404) {
				return "Fant ikke gruppa på tihlde.org, eller den har ikke botsystemet aktivert.";
			}
			if (failure.status === 408) {
				return "tihlde.org svarte ikke i tide.";
			}
			return failure.message ?? `tihlde.org svarte ${failure.status}.`;
	}
}
