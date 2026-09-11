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

	const onSignIn = async () => {
		setIsPending(true);
		try {
			if (process.env.NODE_ENV === "development") {
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
				return;
			}

			const { error } = await authClient.signIn.oauth2({
				providerId: "photon",
				callbackURL: "/",
			});
			if (error) throw new Error(error.message);
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
							{process.env.NODE_ENV === "development"
								? "Logg inn lokalt uten å kontakte TIHLDE"
								: "Du sendes til tihlde.org for å logge inn"}
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
						<span>
							{process.env.NODE_ENV === "development"
								? "Logg inn som testbruker"
								: "Logg inn med TIHLDE"}
						</span>
					)}
				</Button>
			</DialogContent>
		</Dialog>
	);
}
