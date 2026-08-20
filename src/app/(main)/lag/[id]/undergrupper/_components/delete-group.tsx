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
}

export default function DeleteGroup({ groupId, name }: DeleteGroupProps) {
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
			<DialogTrigger asChild>
				<Button variant="ghost" size="sm">
					<Trash2 />
					Slett
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Slett {name}</DialogTitle>
					<DialogDescription>
						Gruppa forsvinner for alle. Medlemmene blir værende på laget.
					</DialogDescription>
				</DialogHeader>

				<div className="grid gap-2">
					<Button
						variant="destructive"
						disabled={status === "pending"}
						onClick={() => deleteGroup({ groupId })}
					>
						Slett undergruppe
					</Button>
					<DialogClose asChild>
						<Button type="button" variant="ghost">
							Avbryt
						</Button>
					</DialogClose>
				</div>
			</DialogContent>
		</Dialog>
	);
}
