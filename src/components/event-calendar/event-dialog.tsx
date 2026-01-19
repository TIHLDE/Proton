"use client";

import { format } from "date-fns";
import { nb } from "date-fns/locale";

import type { TeamEvent } from "@prisma/client";
import EventRegistration from "~/app/(main)/lag/[id]/_components/event-registration";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import { api } from "~/trpc/react";

const getEventTypeLabel = (type: string): string => {
	switch (type) {
		case "MATCH":
			return "Kamp";
		case "TRAINING":
			return "Trening";
		case "SOCIAL":
			return "Sosialt";
		case "OTHER":
			return "Annet";
		default:
			return type;
	}
};

const getEventTypeBgClass = (type: string): string => {
	switch (type) {
		case "MATCH":
			return "bg-gradient-to-b from-[#6e2a70] to-[#4c126b]";
		case "SOCIAL":
			return "bg-gradient-to-b from-[#565220] to-[#563A20]";
		case "TRAINING":
			return "bg-gradient-to-b from-[#3A2056] to-[#0b0941]";
		default:
			return "bg-card";
	}
};

interface EventDialogProps {
	event: TeamEvent | null;
	isOpen: boolean;
	onClose: () => void;
	onSave?: (event: TeamEvent) => void;
	onDelete?: (eventId: string) => void;
}

export function EventDialog({ event, isOpen, onClose }: EventDialogProps) {
	const { data: registration } = api.registration.getMyRegistration.useQuery(
		{ eventId: event?.id || "" },
		{ enabled: !!event && isOpen },
	);

	if (!event) {
		return null;
	}

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle className="font-bold text-3xl">{event.name}</DialogTitle>
					<DialogDescription className="sr-only">
						Event details and registration
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{/* Event Type Badge */}
					<div className="flex items-center gap-2">
						<span
							className={`inline-block rounded-full px-3 py-1 font-medium text-sm text-white ${getEventTypeBgClass(event.eventType)}`}
						>
							{getEventTypeLabel(event.eventType)}
						</span>
					</div>

					{/* Date and Time */}
					<div>
						<h3 className="mb-1 font-semibold text-muted-foreground text-sm">
							Dato og tid
						</h3>
						<p className="text-base">
							{format(new Date(event.startAt), "EEEE d. MMMM yyyy", {
								locale: nb,
							})}
						</p>
						<p className="text-muted-foreground text-sm">
							{format(new Date(event.startAt), "HH:mm", { locale: nb })} -{" "}
							{format(new Date(event.endAt || event.startAt), "HH:mm", {
								locale: nb,
							})}
						</p>
					</div>

					{/* Location */}
					{event.location && (
						<div>
							<h3 className="mb-1 font-semibold text-muted-foreground text-sm">
								Sted
							</h3>
							<p className="text-base">{event.location}</p>
						</div>
					)}

					{/* Registration Deadline */}
					{event.registrationDeadline && (
						<div>
							<h3 className="mb-1 font-semibold text-muted-foreground text-sm">
								Påmeldingsfrist
							</h3>
							<p className="text-base">
								{format(
									new Date(event.registrationDeadline),
									"d. MMM yyyy HH:mm",
									{
										locale: nb,
									},
								)}
							</p>
						</div>
					)}

					{/* Description/Notes */}
					{event.note && (
						<div>
							<h3 className="mb-1 font-semibold text-muted-foreground text-sm">
								Beskrivelse
							</h3>
							<p className="whitespace-pre-wrap text-base leading-relaxed">
								{event.note}
							</p>
						</div>
					)}

					{/* Divider */}
					<div className="border-t" />

					{/* Registration Component */}
					<div>
						<h3 className="mb-4 font-semibold text-lg">Påmelding</h3>
						<EventRegistration
							eventId={event.id}
							initialRegistration={registration}
							registrationDeadline={event.registrationDeadline}
						/>
					</div>
				</div>

				{/* Close Button */}
				<div className="flex justify-end gap-2 border-t pt-4">
					<Button variant="outline" onClick={onClose}>
						Lukk
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
