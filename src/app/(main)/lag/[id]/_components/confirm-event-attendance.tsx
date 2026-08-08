"use client";

import type { RegistrationType } from "@prisma/client";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { P } from "~/components/ui/typography";
import { api } from "~/trpc/react";

type UserPreview = { id: string; name: string; image: string | null };

type AbsenceReason = "overridden" | "not_attending" | "no_response";

type RegistrationRow = {
	id: string;
	type: RegistrationType;
	confirmedAbsent: boolean;
	attendedWithoutRsvp: boolean;
	absenceReason: AbsenceReason | null;
	comment: string | null;
	user: UserPreview;
};

const absenceLabel: Record<AbsenceReason, string> = {
	overridden: "Møtte ikke likevel",
	not_attending: "Meldte fravær",
	no_response: "Svarte ikke",
};

function ExpandableComment({
	id,
	comment,
	expanded,
	onToggle,
}: {
	id: string;
	comment: string;
	expanded: boolean;
	onToggle: () => void;
}) {
	const ref = useRef<HTMLParagraphElement>(null);
	const [isClamped, setIsClamped] = useState(false);

	useEffect(() => {
		const el = ref.current;
		if (el) setIsClamped(el.scrollHeight > el.clientHeight);
	}, [id, comment]);

	return (
		<div className="text-muted-foreground text-xs">
			<p ref={ref} className={expanded ? undefined : "line-clamp-1"}>
				{comment}
			</p>
			{(isClamped || expanded) && (
				<button
					type="button"
					className="underline-offset-2 hover:underline"
					onClick={onToggle}
				>
					{expanded ? "Vis mindre" : "Les mer"}
				</button>
			)}
		</div>
	);
}

interface ConfirmEventAttendanceProps {
	eventId: string;
	eventName: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	isAdmin?: boolean;
}

type Tab = "present" | "absent";

export default function ConfirmEventAttendance({
	eventId,
	eventName,
	open,
	onOpenChange,
	isAdmin = false,
}: ConfirmEventAttendanceProps) {
	const [tab, setTab] = useState<Tab>("present");
	const [selectedWithoutRsvpUserId, setSelectedWithoutRsvpUserId] =
		useState<string>("");
	const [expandedComments, setExpandedComments] = useState<Set<string>>(
		new Set(),
	);
	const utils = api.useUtils();

	const { data: registrations, isLoading } =
		api.registration.getAllByEvent.useQuery({ eventId }, { enabled: open });

	const { data: eligibleWithoutRsvp, isLoading: loadingEligibleWithoutRsvp } =
		api.registration.getEligibleWithoutRsvp.useQuery(
			{ eventId },
			{ enabled: open && isAdmin },
		);

	const { mutate: setConfirmedAbsentMutation, isPending } =
		api.registration.setConfirmedAbsent.useMutation({
			onSuccess: (_, variables) => {
				toast.success(
					variables.confirmedAbsent
						? "Fravær er registrert"
						: "Fravær er fjernet",
				);
				utils.registration.getAllByEvent.invalidate({ eventId });
				utils.registration.getEligibleWithoutRsvp.invalidate({ eventId });
			},
			onError: (error) => {
				toast.error(error.message || "Kunne ikke oppdatere oppmøte");
			},
		});

	const { mutate: addAttendanceWithoutRsvp, isPending: isAddingWithoutRsvp } =
		api.registration.addAttendanceWithoutRsvp.useMutation({
			onSuccess: () => {
				toast.success("Lagt til som møtt opp");
				setSelectedWithoutRsvpUserId("");
				utils.registration.getAllByEvent.invalidate({ eventId });
				utils.registration.getCounts.invalidate({ eventId });
				utils.registration.getNonResponded.invalidate({ eventId });
				utils.registration.getEligibleWithoutRsvp.invalidate({ eventId });
			},
			onError: (error) => {
				toast.error(error.message || "Kunne ikke legge til");
			},
		});

	const present = (registrations ?? []).filter(
		(r: RegistrationRow) => r.absenceReason === null,
	);
	const absent = (registrations ?? []).filter(
		(r: RegistrationRow) => r.absenceReason !== null,
	);

	const list = tab === "present" ? present : absent;

	function toggleComment(id: string) {
		setExpandedComments((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	}

	return (
		<Dialog
			open={open}
			onOpenChange={(next) => {
				onOpenChange(next);
				if (!next) {
					setTab("present");
					setSelectedWithoutRsvpUserId("");
					setExpandedComments(new Set());
				}
			}}
		>
			<DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-4xl">
				<DialogHeader>
					<DialogTitle>
						{isAdmin ? "Bekreft oppmøte" : "Se oppmøte"}
					</DialogTitle>
					<DialogDescription>{eventName}</DialogDescription>
				</DialogHeader>

				<P className="text-muted-foreground text-sm">
					{isAdmin
						? "Under «Møtte opp» vises påmeldte som «kommer». Du kan registrere fravær, eller legge til medlemmer som møtte uten å melde seg på (eller som var avmeldt)."
						: "Listen følger påmelding. Medlemmer merket «Uten påmelding» er lagt inn av leder fordi de møtte uten å være påmeldt som «kommer»."}
				</P>

				{isLoading ? (
					<div className="py-8 text-center">
						<P className="text-muted-foreground">Laster...</P>
					</div>
				) : (
					<>
						<div className="flex gap-2">
							<Button
								type="button"
								variant={tab === "present" ? "default" : "outline"}
								className="flex-1"
								onClick={() => setTab("present")}
							>
								Møtte opp ({present.length})
							</Button>
							<Button
								type="button"
								variant={tab === "absent" ? "default" : "outline"}
								className="flex-1"
								onClick={() => setTab("absent")}
							>
								Møtte ikke ({absent.length})
							</Button>
						</div>

						<div className="space-y-4">
							{list.length === 0 ? (
								<P className="text-muted-foreground">
									{tab === "present"
										? "Ingen påmeldt som kommer, eller alle er registrert som ikke møtt."
										: "Ingen er registrert som ikke møtt."}
								</P>
							) : (
								<div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
									{list.map((row: RegistrationRow) => (
										<div
											key={row.id}
											className="flex flex-col gap-2 rounded-lg border bg-card p-3"
										>
											<div className="flex items-start gap-3">
												<Avatar>
													<AvatarImage
														src={row.user.image ?? undefined}
														alt={row.user.name}
													/>
													<AvatarFallback>{row.user.name[0]}</AvatarFallback>
												</Avatar>
												<div className="min-w-0 flex-1">
													<div className="font-medium leading-tight">
														{row.user.name}
													</div>
													{row.attendedWithoutRsvp && (
														<div className="text-muted-foreground text-xs">
															Uten påmelding
														</div>
													)}
													{row.absenceReason && (
														<div className="text-muted-foreground text-xs">
															{absenceLabel[row.absenceReason]}
														</div>
													)}
													{tab === "absent" && row.comment && (
														<ExpandableComment
															id={row.id}
															comment={row.comment}
															expanded={expandedComments.has(row.id)}
															onToggle={() => toggleComment(row.id)}
														/>
													)}
												</div>
											</div>
											{isAdmin && tab === "present" && (
												<Button
													type="button"
													size="sm"
													variant="outline"
													className="w-full"
													disabled={isPending}
													onClick={() =>
														setConfirmedAbsentMutation({
															eventId,
															userId: row.user.id,
															confirmedAbsent: true,
														})
													}
												>
													Møtte ikke
												</Button>
											)}
											{isAdmin &&
												tab === "absent" &&
												row.absenceReason === "overridden" && (
													<Button
														type="button"
														size="sm"
														variant="outline"
														className="w-full"
														disabled={isPending}
														onClick={() =>
															setConfirmedAbsentMutation({
																eventId,
																userId: row.user.id,
																confirmedAbsent: false,
															})
														}
													>
														Opphev (møtte likevel)
													</Button>
												)}
										</div>
									))}
								</div>
							)}
							{isAdmin && tab === "present" && (
								<div className="space-y-2 rounded-md border border-dashed p-3">
									<P className="font-medium text-sm">
										Legg til som møtte uten påmelding
									</P>
									<P className="text-muted-foreground text-xs">
										Gjelder medlemmer som ikke var påmeldt som «kommer», eller
										som var avmeldt.
									</P>
									{loadingEligibleWithoutRsvp ? (
										<P className="text-muted-foreground text-xs">
											Laster medlemmer…
										</P>
									) : !eligibleWithoutRsvp?.length ? (
										<P className="text-muted-foreground text-xs">
											Ingen flere som kan legges til herfra (alle er allerede
											påmeldt som kommer).
										</P>
									) : (
										<div className="flex flex-col gap-2 sm:flex-row sm:items-end">
											<div className="min-w-0 flex-1">
												<Select
													value={selectedWithoutRsvpUserId || undefined}
													onValueChange={setSelectedWithoutRsvpUserId}
												>
													<SelectTrigger>
														<SelectValue placeholder="Velg medlem" />
													</SelectTrigger>
													<SelectContent>
														{eligibleWithoutRsvp.map((u: UserPreview) => (
															<SelectItem key={u.id} value={u.id}>
																{u.name}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</div>
											<Button
												type="button"
												className="shrink-0 sm:w-auto"
												disabled={
													!selectedWithoutRsvpUserId ||
													isAddingWithoutRsvp ||
													isPending
												}
												onClick={() =>
													addAttendanceWithoutRsvp({
														eventId,
														userId: selectedWithoutRsvpUserId,
													})
												}
											>
												Legg til
											</Button>
										</div>
									)}
								</div>
							)}
						</div>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
