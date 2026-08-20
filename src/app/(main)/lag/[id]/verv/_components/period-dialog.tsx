"use client";

import { format } from "date-fns";
import { Pencil, Plus } from "lucide-react";
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

interface PeriodDialogProps {
	teamId: string;
	period?: {
		id: string;
		name: string | null;
		startDate: Date;
		endDate: Date;
	};
}

const toInputValue = (date: Date) => format(date, "yyyy-MM-dd");

export default function PeriodDialog({ teamId, period }: PeriodDialogProps) {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState(period?.name ?? "");
	const [startDate, setStartDate] = useState(
		period ? toInputValue(period.startDate) : "",
	);
	const [endDate, setEndDate] = useState(
		period ? toInputValue(period.endDate) : "",
	);
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
			startDate: new Date(startDate),
			endDate: new Date(endDate),
		};

		if (period) {
			updatePeriod({ periodId: period.id, ...values });
		} else {
			createPeriod({ teamId, ...values });
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{period ? (
					<Button variant="ghost" size="sm">
						<Pencil />
						Endre
					</Button>
				) : (
					<Button>
						<Plus />
						Ny periode
					</Button>
				)}
			</DialogTrigger>
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
							<Input
								id="period-start"
								type="date"
								value={startDate}
								onChange={(event) => setStartDate(event.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="period-end">Til</Label>
							<Input
								id="period-end"
								type="date"
								value={endDate}
								onChange={(event) => setEndDate(event.target.value)}
							/>
						</div>
					</div>
				</div>

				<div className="grid gap-2">
					<Button disabled={isCreating || isUpdating} onClick={submit}>
						{period ? "Lagre" : "Opprett"}
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
