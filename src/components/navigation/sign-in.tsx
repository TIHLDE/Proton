"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "~/lib/auth-client";
import TihldeLogo from "../logo";
import { Button } from "../ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";

export default function LoginForm() {
	const [open, setOpen] = useState<boolean>(false);
	const [isPending, setIsPending] = useState<boolean>(false);

	/**
	 * Sender brukeren til tihlde.org. Passordet skrives inn der, aldri her —
	 * denne appen ser det ikke, og Feide-innlogging blir tilgjengelig på
	 * kjøpet. Ingen redirect tilbake å håndtere: better-auth setter sesjonen i
	 * callback-ruten og sender brukeren videre selv.
	 */
	const onSignIn = async () => {
		setIsPending(true);
		try {
			const { error } = await authClient.signIn.oauth2({
				providerId: "photon",
				callbackURL: "/",
			});

			if (error) {
				toast.error(error.message ?? "Noe gikk galt under innloggingen.");
				setIsPending(false);
			}
		} catch {
			toast.error(
				"Noe gikk galt under innloggingen. Vennligst prøv igjen senere.",
			);
			setIsPending(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger render={<Button variant="outline">Logg inn</Button>} />
			<DialogContent className="md:max-w-md">
				<div className="mb-4 flex flex-col items-center gap-2">
					<div
						className="flex size-14 shrink-0 items-center justify-center rounded-full border"
						aria-hidden="true"
					>
						<TihldeLogo size="small" className="size-9" />
					</div>
					<DialogHeader>
						<DialogTitle className="sm:text-center">
							Velkommen tilbake
						</DialogTitle>
						<DialogDescription className="sm:text-center">
							Du sendes til tihlde.org for å logge inn
						</DialogDescription>
					</DialogHeader>
				</div>

				<Button
					type="button"
					className="w-full"
					disabled={isPending}
					onClick={onSignIn}
				>
					{isPending ? (
						<Loader2 className="animate-spin" />
					) : (
						<span>Logg inn med TIHLDE</span>
					)}
				</Button>
			</DialogContent>
		</Dialog>
	);
}
