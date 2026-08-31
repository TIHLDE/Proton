"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { authClient } from "~/lib/auth-client";

// Bare handlingen, ingen markup. Base UIs menyvalg er ikke en <button>, så en
// utloggingsknapp kan ikke lenger sendes inn som `render` — den ville gitt
// menyvalget dobbelt sett med semantikk. I stedet lar vi DropdownMenuItem
// være hele UI-et og henter oppførselen herfra.
export function useLogout() {
	const [isPending, startTransition] = useTransition();
	const router = useRouter();

	const logout = () => {
		startTransition(async () => {
			try {
				const res = await authClient.signOut();
				if (res.error) {
					toast.error(res.error.message);
				} else {
					// Ingen egen TIHLDE-cookie å rydde lenger — tokenet ligger på
					// account-raden og forsvinner med sesjonen.
					router.replace("/");
				}
			} catch {
				toast.error(
					"Noe gikk galt under utloggingen. Vennligst prøv igjen senere.",
				);
			}
		});
	};

	return { logout, isPending };
}
