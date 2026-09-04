"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { authClient } from "~/lib/auth-client";

// Eier ingen markup: DropdownMenuItem er ikke en <button>, så en knapp her
// ville gitt menyvalget dobbel semantikk.
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
