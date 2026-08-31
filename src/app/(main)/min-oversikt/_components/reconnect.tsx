"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { authClient } from "~/lib/auth-client";

/**
 * Vises bare når tilgangen til Photon er utløpt. Å kjøre OAuth-flyten på nytt
 * skriver ferske tokens på account-raden, så brukeren slipper å logge ut først
 * — dette er alt som skal til for at synkingen tar seg inn igjen.
 */
export default function ReconnectButton() {
	const [isPending, setIsPending] = useState(false);

	const onClick = async () => {
		setIsPending(true);
		try {
			const { data, error } = await authClient.signIn.oauth2({
				providerId: "photon",
				callbackURL: "/min-oversikt",
			});

			if (error) {
				toast.error(error.message ?? "Noe gikk galt. Prøv igjen senere.");
				setIsPending(false);
				return;
			}

			// Navigasjonen gjøres her, ikke overlatt til better-auth sin
			// redirect-hook. Hooken kjører på `onSuccess` og har ingen synlig
			// feilvei: uteblir den, står knappen bare stille. Det skjedde i
			// prod uten spor i konsoll eller nettverk.
			if (data?.url) {
				window.location.href = data.url;
				return;
			}

			// Skal ikke kunne skje — endepunktet svarer alltid med en URL. Men
			// stille skal det ikke være, for det var nettopp stillheten som
			// gjorde forrige feil umulig å feilsøke.
			toast.error(
				"Fikk ikke svar fra TIHLDE. Logg ut og inn igjen for å koble til på nytt.",
			);
			setIsPending(false);
		} catch {
			toast.error("Noe gikk galt. Prøv igjen senere.");
			setIsPending(false);
		}
	};

	return (
		<Button size="sm" variant="outline" disabled={isPending} onClick={onClick}>
			{isPending && <Loader2 className="animate-spin" />}
			Koble til TIHLDE på nytt
		</Button>
	);
}
