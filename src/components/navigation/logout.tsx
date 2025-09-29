"use client";

import { Loader2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { clearTIHLDEToken } from "~/actions";
import { authClient } from "~/lib/auth-client";

export default function Logout() {
	const [isPending, startTransition] = useTransition();
	const router = useRouter();

	const onLogout = async () => {
		startTransition(async () => {
			try {
				const res = await authClient.signOut();
				if (res.error) {
					toast.error(res.error.message);
				} else {
					await clearTIHLDEToken();
					router.replace("/auth/logg-inn");
				}
			} catch {
				toast.error(
					"Noe gikk galt under utloggingen. Vennligst prøv igjen senere.",
				);
			}
		});
	};

	return (
		<button
			type="button"
			onClick={onLogout}
			disabled={isPending}
			className="data-[variant=destructive]:*:[svg]:!text-destructive relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[inset]:pl-8 data-[variant=destructive]:text-destructive data-[disabled]:opacity-50 data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0"
		>
			{isPending ? (
				<Loader2 className="h-5! w-5! animate-spin" />
			) : (
				<LogOut className="h-5! w-5!" />
			)}
			Logg ut
		</button>
	);
}
