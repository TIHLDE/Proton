"use client";

import type { TeamEventType } from "@prisma/client";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { api } from "~/trpc/react";

/** Å ikke svare på en kamp koster dobbelt, siden laget må vite om det stiller. */
function defaultQuantity(eventType: TeamEventType) {
	return eventType === "MATCH" ? 2 : 1;
}

// Base UIs Select tåler ikke tom streng som verdi, så «ingen paragraf» trenger
// en egen verdi.
const NO_LAW = "none";

/** getNonResponded er typet som any på serveren, så formen står her. */
type NonResponder = {
	id: string;
	user: { id: string; name: string };
	inactive: boolean;
};

interface GiveFinesButtonProps {
	eventId: string;
	eventName: string;
	eventType: TeamEventType;
}

export default function GiveFinesButton({
	eventId,
	eventName,
	eventType,
}: GiveFinesButtonProps) {
	const { id: teamId } = useParams<{ id: string }>();
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [quantity, setQuantity] = useState(String(defaultQuantity(eventType)));
	const [reason, setReason] = useState("");
	const [lawId, setLawId] = useState(NO_LAW);
	// Hvem som er krysset av bort. Å lagre de fravalgte i stedet for de valgte
	// gjør at alle er valgt så snart lista er hentet.
	const [deselected, setDeselected] = useState<Set<string>>(new Set());

	const defaultReason = `Ikke svart på «${eventName}»`;

	// Hentes først når dialogen åpnes, så en liste med mange arrangementer
	// ikke gir ett kall per kort.
	const { data: unanswered, isLoading } =
		api.registration.getNonResponded.useQuery({ eventId }, { enabled: open });

	const { data: lawsResult, isLoading: lawsLoading } =
		api.fine.getLaws.useQuery({ teamId }, { enabled: open });
	const laws = lawsResult?.ok ? lawsResult.laws : [];

	const lawItems = [
		{ value: NO_LAW, label: "Ingen paragraf" },
		...laws.map((law) => ({
			value: law.id,
			label: `§ ${law.paragraph} ${law.title}`,
		})),
	];

	const { mutate: giveFines, isPending } = api.fine.giveNoResponse.useMutation({
		onSuccess: ({ given, skipped, failed, sentToTihlde }) => {
			if (given.length > 0) {
				toast.success(
					sentToTihlde
						? `${given.length} fikk bot på tihlde.org.`
						: `${given.length} fikk bot, men bare lokalt: PHOTON_FINES_ENABLED er av.`,
				);
			}
			if (skipped.length > 0) {
				toast.info(
					`Hoppet over: ${skipped.map((s) => `${s.name} (${s.message})`).join(", ")}`,
				);
			}
			if (failed.length > 0) {
				toast.error(
					`Feilet: ${failed.map((f) => `${f.name} (${f.message})`).join(", ")}`,
				);
			}
			if (given.length === 0 && skipped.length === 0 && failed.length === 0) {
				toast.info("Alle har svart.");
			}
			setOpen(false);
			router.refresh();
		},
		onError: (error) => toast.error(error.message),
	});

	// Dialogen forblir montert etter lukking, så feltene settes tilbake ved åpning.
	const handleOpenChange = (next: boolean) => {
		if (next) {
			setQuantity(String(defaultQuantity(eventType)));
			setReason(defaultReason);
			setLawId(NO_LAW);
			setDeselected(new Set());
		}
		setOpen(next);
	};

	const members: NonResponder[] = unanswered ?? [];
	// Inaktive står i lista så admin ser hvorfor de slipper, men kan ikke velges.
	const eligible = members.filter((member) => !member.inactive);
	const selectedIds = eligible
		.filter((member) => !deselected.has(member.user.id))
		.map((member) => member.user.id);
	const count = selectedIds.length;
	const allSelected = count === eligible.length;

	const toggle = (userId: string) =>
		setDeselected((previous) => {
			const next = new Set(previous);
			if (next.has(userId)) next.delete(userId);
			else next.add(userId);
			return next;
		});

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger
				render={
					<Button variant="outline">Gi bot til de som ikke svarte</Button>
				}
			/>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Gi bot for manglende svar</DialogTitle>
					<DialogDescription>
						De du krysser av blant dem som ikke har svart på «{eventName}», får
						en bot i gruppa på tihlde.org. Den venter på godkjenning til
						botsjefen godkjenner den der. De som allerede har fått bot for dette
						arrangementet, får ikke en til.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					<div className="space-y-2">
						<div className="flex items-center justify-between gap-2">
							<Label>
								{isLoading
									? "Henter hvem som ikke har svart …"
									: members.length === 0
										? "Alle har svart."
										: `${members.length} har ikke svart`}
							</Label>
							{eligible.length > 1 && (
								<Button
									type="button"
									variant="link"
									size="sm"
									onClick={() =>
										setDeselected(
											allSelected
												? new Set(eligible.map((member) => member.user.id))
												: new Set(),
										)
									}
								>
									{allSelected ? "Fjern alle" : "Velg alle"}
								</Button>
							)}
						</div>
						{members.length > 0 && (
							<div className="max-h-56 space-y-1 overflow-y-auto rounded-md border p-2">
								{members.map((member) => {
									const checkboxId = `fine-${eventId}-${member.user.id}`;
									return (
										<div
											key={member.id}
											className="flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-accent"
										>
											<Checkbox
												id={checkboxId}
												checked={
													!member.inactive && !deselected.has(member.user.id)
												}
												disabled={member.inactive}
												onCheckedChange={() => toggle(member.user.id)}
											/>
											<Label
												htmlFor={checkboxId}
												className={
													member.inactive
														? "flex-1 font-normal text-muted-foreground"
														: "flex-1 cursor-pointer font-normal"
												}
											>
												{member.user.name}
												{member.inactive && " (inaktiv, får ikke bot)"}
											</Label>
										</div>
									);
								})}
							</div>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="fine-quantity">Antall bøter per person</Label>
						<Input
							id="fine-quantity"
							type="number"
							inputMode="numeric"
							min={-20}
							max={20}
							value={quantity}
							onChange={(event) => setQuantity(event.target.value)}
						/>
						<p className="text-muted-foreground text-xs">
							0 vises som en advarsel på tihlde.org. Negativt trekker fra.
						</p>
					</div>

					<div className="space-y-2">
						<Label htmlFor="fine-law">Paragraf</Label>
						<Select
							items={lawItems}
							value={lawId}
							onValueChange={(value) => setLawId(value ?? NO_LAW)}
							disabled={lawsLoading || laws.length === 0}
						>
							<SelectTrigger id="fine-law" className="w-full">
								<SelectValue
									placeholder={
										lawsLoading ? "Henter lovverket …" : "Ingen paragraf"
									}
								/>
							</SelectTrigger>
							<SelectContent>
								{lawItems.map((item) => (
									<SelectItem key={item.value} value={item.value}>
										{item.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{lawsResult && !lawsResult.ok && (
							<p className="text-muted-foreground text-xs">
								{lawsResult.message}
							</p>
						)}
						{lawsResult?.ok && laws.length === 0 && (
							<p className="text-muted-foreground text-xs">
								Gruppa har ikke noe lovverk på tihlde.org.
							</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="fine-reason">Grunn</Label>
						<Input
							id="fine-reason"
							value={reason}
							onChange={(event) => setReason(event.target.value)}
						/>
					</div>
				</div>

				<div className="grid gap-2">
					<Button
						disabled={isPending || isLoading || count === 0}
						onClick={() => {
							// Et tomt felt ville blitt Number("") = 0, altså en
							// advarsel ingen har valgt å gi.
							if (quantity.trim() === "") {
								toast.error("Skriv inn antall bøter.");
								return;
							}
							giveFines({
								eventId,
								userIds: selectedIds,
								quantity: Number(quantity),
								reason,
								lawId: lawId === NO_LAW ? undefined : lawId,
							});
						}}
					>
						{isPending
							? "Gir bøter …"
							: count === 0
								? "Gi bøter"
								: `Gi bøter til ${count} ${count === 1 ? "person" : "personer"}`}
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
