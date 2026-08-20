"use client";

import { Trash2 } from "lucide-react";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { api } from "~/trpc/react";

interface PeriodAdminProps {
	periodId: string;
	periodLabel: string;
	assignmentCount: number;
	positions: { id: string; name: string }[];
	members: { id: string; name: string }[];
	missingPositions: { id: string; name: string }[];
}

export default function PeriodAdmin({
	periodId,
	periodLabel,
	assignmentCount,
	positions,
	members,
	missingPositions,
}: PeriodAdminProps) {
	const [positionId, setPositionId] = useState("");
	const [userId, setUserId] = useState("");
	const router = useRouter();

	const { mutate: addAssignment, isPending } =
		api.leadership.addAssignment.useMutation({
			onSuccess: () => {
				setUserId("");
				router.refresh();
			},
			onError: (error) => toast.error(error.message),
		});

	const [deleteOpen, setDeleteOpen] = useState(false);

	const { mutate: deletePeriod, isPending: isDeleting } =
		api.leadership.deletePeriod.useMutation({
			onSuccess: () => {
				setDeleteOpen(false);
				router.refresh();
			},
			onError: (error) => toast.error(error.message),
		});

	return (
		<div className="space-y-3 border-t pt-4">
			{missingPositions.length > 0 && (
				<p className="text-muted-foreground text-xs">
					Mangler: {missingPositions.map((p) => p.name).join(", ")}
				</p>
			)}

			<div className="space-y-2">
				<Label className="text-xs">Tildel verv</Label>
				<div className="flex flex-col gap-2 sm:flex-row">
					<Select value={positionId} onValueChange={setPositionId}>
						<SelectTrigger className="sm:w-44" aria-label="Verv">
							<SelectValue placeholder="Velg verv" />
						</SelectTrigger>
						<SelectContent>
							{positions.map((position) => (
								<SelectItem key={position.id} value={position.id}>
									{position.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<Select value={userId} onValueChange={setUserId}>
						<SelectTrigger className="flex-1" aria-label="Person">
							<SelectValue placeholder="Velg person" />
						</SelectTrigger>
						<SelectContent>
							{members.map((member) => (
								<SelectItem key={member.id} value={member.id}>
									{member.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<Button
						disabled={!positionId || !userId || isPending}
						onClick={() => addAssignment({ periodId, positionId, userId })}
					>
						Legg til
					</Button>
				</div>
			</div>

			<Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
				<DialogTrigger asChild>
					<Button variant="ghost" size="sm">
						<Trash2 />
						Slett perioden
					</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Slett {periodLabel}</DialogTitle>
						<DialogDescription>
							{assignmentCount === 0
								? "Perioden forsvinner. Vervene i laget består."
								: assignmentCount === 1
									? "Perioden og den ene tildelingen i den forsvinner. Vervene i laget består."
									: `Perioden og de ${assignmentCount} tildelingene i den forsvinner. Vervene i laget består.`}
						</DialogDescription>
					</DialogHeader>

					<div className="grid gap-2">
						<Button
							variant="destructive"
							disabled={isDeleting}
							onClick={() => deletePeriod({ periodId })}
						>
							Slett perioden
						</Button>
						<DialogClose asChild>
							<Button type="button" variant="ghost">
								Avbryt
							</Button>
						</DialogClose>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
