"use client";

import { Loader2, RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";

export default function SyncMemberships() {
	const router = useRouter();

	const { mutate: syncMemberships, status } =
		api.me.team.membership.syncMemberships.useMutation({
			onSuccess: () => {
				router.refresh();
				toast.success("Medlemskap oppdatert!");
			},
			onError: (error) => {
				toast.error(error.message);
			},
		});

	const onClick = async () => syncMemberships();

	return (
		<Button onClick={onClick} disabled={status === "pending"}>
			{status === "pending" ? (
				<Loader2 className="animate-spin" />
			) : (
				<RefreshCcw />
			)}
			Hent medlemskap
		</Button>
	);
}
