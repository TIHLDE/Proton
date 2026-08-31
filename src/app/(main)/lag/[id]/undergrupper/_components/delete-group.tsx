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
import { api } from "~/trpc/react";

interface DeleteGroupProps {
	groupId: string;
	name: string;
	opensUpIfDeleted: number;
}

export default function DeleteGroup({
	groupId,
	name,
	opensUpIfDeleted,
}: DeleteGroupProps) {
	const [open, setOpen] = useState(false);
	const router = useRouter();

	const { mutate: deleteGroup, status } = api.group.delete.useMutation({
		onSuccess: () => {
			toast.success("Undergruppen ble slettet.");
			setOpen(false);
			router.refresh();
		},
		onError: (error) => toast.error(error.message),
	});

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger
				render={
					<Button variant="ghost" size="sm">
						<Trash2 />
						Slett
					</Button>
				}
			/>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Slett {name}</DialogTitle>
					<DialogDescription>
						Gruppa forsvinner for alle. Medlemmene blir værende på laget.
					</DialogDescription>
				</DialogHeader>

				{opensUpIfDeleted > 0 && (
					<div className="rounded-md bg-yellow-500/10 p-3 text-sm text-yellow-600">
						{opensUpIfDeleted === 1
							? "Ett kommende arrangement er bare åpent for denne gruppa, og blir åpent for hele laget."
							: `${opensUpIfDeleted} kommende arrangementer er bare åpne for denne gruppa, og blir åpne for hele laget.`}
					</div>
				)}

				<div className="grid gap-2">
					<Button
						variant="destructive"
						disabled={status === "pending"}
						onClick={() => deleteGroup({ groupId })}
					>
						Slett undergruppe
					</Button>
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
