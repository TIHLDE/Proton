"use client";

import type { TeamEventType } from "@prisma/client";
import { useParams, useRouter } from "next/navigation";
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
	user: { name: string };
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
		}
		setOpen(next);
	};

	const members: NonResponder[] = unanswered ?? [];
	// Inaktive står i lista så admin ser hvorfor de slipper, men telles ikke.
	const count = members.filter((member) => !member.inactive).length;

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
						Alle inviterte som ikke har svart på «{eventName}» får en bot i
						gruppa på tihlde.org. Den venter på godkjenning til botsjefen
						godkjenner den der. De som allerede har fått bot for dette
						arrangementet, får ikke en til.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					<div className="space-y-2">
						<Label>
							{isLoading
								? "Henter hvem som ikke har svart …"
								: members.length === 0
									? "Alle har svart."
									: `${members.length} har ikke svart`}
						</Label>
						{members.length > 0 && (
							<ul className="max-h-40 overflow-y-auto rounded-md border p-2 text-sm">
								{members.map((member) => (
									<li
										key={member.id}
										className={
											member.inactive
												? "px-2 py-1 text-muted-foreground"
												: "px-2 py-1"
										}
									>
										{member.user.name}
										{member.inactive && " (inaktiv, får ikke bot)"}
									</li>
								))}
							</ul>
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
