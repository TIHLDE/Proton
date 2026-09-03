"use client";

import { nb } from "date-fns/locale";
import { Pencil, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { DatePicker } from "~/components/ui/date-picker";
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
import { anchorToAppZone, toAppZone } from "~/lib/datetime";
import { api } from "~/trpc/react";

interface PeriodDialogProps {
	teamId: string;
	period?: {
		id: string;
		name: string | null;
		startDate: Date;
		endDate: Date;
	};
}

export default function PeriodDialog({ teamId, period }: PeriodDialogProps) {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState(period?.name ?? "");
	// Datoene holdes som Date, ikke som "yyyy-MM-dd"-strenger. new Date("2026-01-01")
	// tolkes som UTC-midnatt, som i norsk tid blir 1. januar 01:00 om vinteren —
	// og en dato valgt rett før månedsskiftet kunne havne i feil måned.
	const [startDate, setStartDate] = useState<Date | null>(
		period?.startDate ?? null,
	);
	const [endDate, setEndDate] = useState<Date | null>(period?.endDate ?? null);
	const router = useRouter();

	const onDone = () => {
		setOpen(false);
		router.refresh();
	};

	const { mutate: createPeriod, isPending: isCreating } =
		api.leadership.createPeriod.useMutation({
			onSuccess: onDone,
			onError: (error) => toast.error(error.message),
		});

	const { mutate: updatePeriod, isPending: isUpdating } =
		api.leadership.updatePeriod.useMutation({
			onSuccess: onDone,
			onError: (error) => toast.error(error.message),
		});

	const submit = () => {
		if (!startDate || !endDate) {
			toast.error("Du må velge både start og slutt.");
			return;
		}

		const values = {
			name: name.trim() || undefined,
			startDate,
			endDate,
		};

		if (period) {
			updatePeriod({ periodId: period.id, ...values });
		} else {
			createPeriod({ teamId, ...values });
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger
				render={
					period ? (
						<Button variant="ghost" size="sm">
							<Pencil />
							Endre
						</Button>
					) : (
						<Button>
							<Plus />
							Ny periode
						</Button>
					)
				}
			/>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{period ? "Endre periode" : "Ny periode"}</DialogTitle>
					<DialogDescription>
						En periode er tiden et styre sitter.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="period-name">Navn (valgfritt)</Label>
						<Input
							id="period-name"
							placeholder="Styret 2026"
							value={name}
							onChange={(event) => setName(event.target.value)}
						/>
					</div>

					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="period-start">Fra</Label>
							<DatePicker
								id="period-start"
								value={startDate ? toAppZone(startDate) : null}
								onValueChange={(date) =>
									setStartDate(date ? anchorToAppZone(date) : null)
								}
								locale={nb}
								placeholder="Velg dato"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="period-end">Til</Label>
							<DatePicker
								id="period-end"
								value={endDate ? toAppZone(endDate) : null}
								onValueChange={(date) =>
									setEndDate(date ? anchorToAppZone(date) : null)
								}
								locale={nb}
								placeholder="Velg dato"
								minDate={startDate ? toAppZone(startDate) : undefined}
							/>
						</div>
					</div>
				</div>

				<div className="grid gap-2">
					<Button disabled={isCreating || isUpdating} onClick={submit}>
						{period ? "Lagre" : "Opprett"}
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
