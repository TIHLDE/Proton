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

// Testbrukeren finnes bare lokalt. TIHLDE-innloggingen virker også lokalt,
// så lenge OAuth-klienten har localhost-callbacken som redirect-URI.
const isDevelopment = process.env.NODE_ENV === "development";

export default function LoginForm() {
	const [open, setOpen] = useState<boolean>(false);
	const [pending, setPending] = useState<"tihlde" | "test" | null>(null);

	const onError = () => {
		toast.error(
			"Noe gikk galt under innloggingen. Vennligst prøv igjen senere.",
		);
		setPending(null);
	};

	const onSignInWithTihlde = async () => {
		setPending("tihlde");
		try {
			const { error } = await authClient.signIn.oauth2({
				providerId: "photon",
				callbackURL: "/",
			});
			if (error) throw new Error(error.message);
		} catch {
			onError();
		}
	};

	const onSignInAsTestUser = async () => {
		setPending("test");
		try {
			const credentials = {
				email: "local-test-user@example.com",
				password: "local-development-password",
			};
			const signIn = await authClient.signIn.email(credentials);
			if (signIn.error) {
				const signUp = await authClient.signUp.email({
					...credentials,
					name: "Lokal testbruker",
					username: "local-test-user",
				});
				if (signUp.error) throw new Error(signUp.error.message);
			}
			window.location.assign("/");
		} catch {
			onError();
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

				<div className="grid gap-2">
					<Button
						type="button"
						className="w-full"
						disabled={pending !== null}
						onClick={onSignInWithTihlde}
					>
						{pending === "tihlde" ? (
							<Loader2 className="animate-spin" />
						) : (
							<span>Logg inn med TIHLDE</span>
						)}
					</Button>

					{isDevelopment && (
						<Button
							type="button"
							variant="ghost"
							className="w-full"
							disabled={pending !== null}
							onClick={onSignInAsTestUser}
						>
							{pending === "test" ? (
								<Loader2 className="animate-spin" />
							) : (
								<span>Logg inn som testbruker (lokalt)</span>
							)}
						</Button>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
