"use client";

import { PauseCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { api } from "~/trpc/react";

interface SetInactiveProps {
	membershipId: string;
	name: string;
	inactiveReason: string | null;
}

export default function SetInactive({
	membershipId,
	name,
	inactiveReason,
}: SetInactiveProps) {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [reason, setReason] = useState(inactiveReason ?? "");
	const isInactive = inactiveReason !== null;

	const { mutate: setInactive, isPending } =
		api.team.membership.setInactive.useMutation({
			onSuccess: (_, { inactive }) => {
				toast.success(
					inactive
						? `${name} er merket som inaktiv.`
						: `${name} er aktiv igjen.`,
				);
				setOpen(false);
				router.refresh();
			},
			onError: (error) => toast.error(error.message),
		});

	// Dialogen forblir montert etter lukking, så feltet settes tilbake ved åpning.
	const handleOpenChange = (next: boolean) => {
		if (next) setReason(inactiveReason ?? "");
		setOpen(next);
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger
				render={
					<Button variant="link">
						{isInactive ? "Endre inaktiv" : "Merk som inaktiv"}
						<PauseCircle />
					</Button>
				}
			/>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{isInactive ? `${name} er inaktiv` : `Merk ${name} som inaktiv`}
					</DialogTitle>
					<DialogDescription>
						Inaktive spillere får ikke bot for å ikke ha svart på arrangementer.
						Begrunnelsen vises bare for lagets ledelse.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-2">
					<Label htmlFor={`inactive-reason-${membershipId}`}>Begrunnelse</Label>
					<Textarea
						id={`inactive-reason-${membershipId}`}
						placeholder="F.eks. skadet ut sesongen, utveksling"
						value={reason}
						onChange={(event) => setReason(event.target.value)}
					/>
				</div>

				<div className="grid gap-2">
					<Button
						disabled={isPending || reason.trim() === ""}
						onClick={() =>
							setInactive({ membershipId, inactive: true, reason })
						}
					>
						{isInactive ? "Lagre begrunnelse" : "Merk som inaktiv"}
					</Button>
					{isInactive && (
						<Button
							variant="outline"
							disabled={isPending}
							onClick={() => setInactive({ membershipId, inactive: false })}
						>
							Merk som aktiv
						</Button>
					)}
					<DialogClose
						render={
							<Button type="button" variant="ghost">
								Avbryt
							</Button>
						}
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}
