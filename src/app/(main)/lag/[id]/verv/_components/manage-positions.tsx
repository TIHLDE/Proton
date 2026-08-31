"use client";

import { Plus, Settings2, Trash2 } from "lucide-react";
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
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { api } from "~/trpc/react";

interface ManagePositionsProps {
	teamId: string;
	positions: { id: string; name: string }[];
}

export default function ManagePositions({
	teamId,
	positions,
}: ManagePositionsProps) {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState("");
	const router = useRouter();

	const { mutate: createPosition, isPending } =
		api.leadership.createPosition.useMutation({
			onSuccess: () => {
				setName("");
				router.refresh();
			},
			onError: (error) => toast.error(error.message),
		});

	const { mutate: deletePosition } = api.leadership.deletePosition.useMutation({
		onSuccess: () => router.refresh(),
		onError: (error) => toast.error(error.message),
	});

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger
				render={
					<Button variant="outline">
						<Settings2 />
						Verv
					</Button>
				}
			/>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Vervene i laget</DialogTitle>
					<DialogDescription>
						Lag de vervene dere faktisk har. De brukes i alle periodene.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-1">
					{positions.length === 0 && (
						<p className="py-4 text-center text-muted-foreground text-sm">
							Ingen verv er opprettet.
						</p>
					)}
					{positions.map((position) => (
						<div
							key={position.id}
							className="flex items-center justify-between gap-2 rounded-md px-2 py-1 text-sm hover:bg-accent"
						>
							<span>{position.name}</span>
							<Button
								variant="ghost"
								size="sm"
								aria-label={`Slett ${position.name}`}
								onClick={() => deletePosition({ positionId: position.id })}
							>
								<Trash2 />
							</Button>
						</div>
					))}
				</div>

				<div className="space-y-2 border-t pt-4">
					<Label htmlFor="new-position">Nytt verv</Label>
					<div className="flex gap-2">
						<Input
							id="new-position"
							placeholder="Botsjef"
							value={name}
							onChange={(event) => setName(event.target.value)}
						/>
						<Button
							disabled={!name.trim() || isPending}
							onClick={() =>
								createPosition({ teamId, name: name.trim(), order: 0 })
							}
						>
							<Plus />
						</Button>
					</div>
				</div>

				<DialogClose
					render={
						<Button type="button" variant="ghost">
							Lukk
						</Button>
					}
				/>
			</DialogContent>
		</Dialog>
	);
}
