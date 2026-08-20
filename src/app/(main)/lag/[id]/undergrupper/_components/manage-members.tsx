"use client";

import { UsersRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
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

interface ManageMembersProps {
	groupId: string;
	groupName: string;
	teamMembers: { id: string; name: string }[];
	memberIds: string[];
}

export default function ManageMembers({
	groupId,
	groupName,
	teamMembers,
	memberIds,
}: ManageMembersProps) {
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");
	const [selected, setSelected] = useState<Set<string>>(new Set(memberIds));
	const router = useRouter();

	const { mutate: setMembers, status } = api.group.setMembers.useMutation({
		onSuccess: () => {
			toast.success("Medlemmene ble oppdatert.");
			setOpen(false);
			router.refresh();
		},
		onError: (error) => toast.error(error.message),
	});

	const visible = useMemo(() => {
		const query = search.trim().toLowerCase();
		if (!query) return teamMembers;
		return teamMembers.filter((member) =>
			member.name.toLowerCase().includes(query),
		);
	}, [search, teamMembers]);

	const toggle = (userId: string) => {
		setSelected((prev) => {
			const next = new Set(prev);
			if (next.has(userId)) {
				next.delete(userId);
			} else {
				next.add(userId);
			}
			return next;
		});
	};

	// Dialogen kan åpnes på nytt etter en avbrutt endring, så utvalget
	// settes tilbake til det som faktisk er lagret hver gang den åpnes.
	const onOpenChange = (next: boolean) => {
		if (next) setSelected(new Set(memberIds));
		setSearch("");
		setOpen(next);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm">
					<UsersRound />
					Medlemmer
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Medlemmer i {groupName}</DialogTitle>
					<DialogDescription>
						Huk av hvem som hører til. Folk kan være med i flere grupper.
					</DialogDescription>
				</DialogHeader>

				<Input
					placeholder="Søk etter navn"
					value={search}
					onChange={(event) => setSearch(event.target.value)}
				/>

				<div className="max-h-72 space-y-1 overflow-y-auto">
					{visible.length === 0 && (
						<p className="py-6 text-center text-muted-foreground text-sm">
							Ingen treff.
						</p>
					)}
					{visible.map((member) => (
						<div
							key={member.id}
							className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-accent"
						>
							<Checkbox
								id={`${groupId}-${member.id}`}
								checked={selected.has(member.id)}
								onCheckedChange={() => toggle(member.id)}
							/>
							<Label
								htmlFor={`${groupId}-${member.id}`}
								className="flex-1 cursor-pointer font-normal"
							>
								{member.name}
							</Label>
						</div>
					))}
				</div>

				<div className="grid gap-2">
					<Button
						disabled={status === "pending"}
						onClick={() => setMembers({ groupId, userIds: [...selected] })}
					>
						Lagre ({selected.size})
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
