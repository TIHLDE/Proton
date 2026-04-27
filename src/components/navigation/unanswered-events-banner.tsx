"use client";

import type { TeamEvent } from "@prisma/client";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { ListChecks, X } from "lucide-react";
import { useEffect, useState } from "react";
import { EventDialog } from "~/components/event-calendar/event-dialog";
import { Button } from "~/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "~/components/ui/sheet";
import { getEventTypeLabel } from "~/lib/event-presentation";
import { api } from "~/trpc/react";

type UnansweredEvent = TeamEvent & { team?: { name: string } };

const DISMISSED_KEY = "unanswered-events-banner-dismissed";

export default function UnansweredEventsBanner() {
	const { data: unansweredEvents } = api.event.getUnanswered.useQuery();
	const [dismissed, setDismissed] = useState(true);
	const [isSheetOpen, setIsSheetOpen] = useState(false);
	const [selectedEvent, setSelectedEvent] = useState<TeamEvent | null>(null);
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	useEffect(() => {
		const wasDismissed = sessionStorage.getItem(DISMISSED_KEY) === "true";
		setDismissed(wasDismissed);
	}, []);

	const handleDismiss = () => {
		sessionStorage.setItem(DISMISSED_KEY, "true");
		setDismissed(true);
	};

	const handleEventClick = (event: UnansweredEvent) => {
		setSelectedEvent(event);
		setIsSheetOpen(false);
		setIsDialogOpen(true);
	};

	if (dismissed || !unansweredEvents || unansweredEvents.length === 0) {
		return null;
	}

	return (
		<>
			<div className="fixed right-4 bottom-20 left-4 z-20 sm:bottom-4 sm:left-auto sm:w-80">
				<div className="flex items-start gap-3 rounded-lg border bg-card px-4 py-3 text-card-foreground shadow-md">
					<ListChecks className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
					<div className="min-w-0 flex-1">
						<p className="font-medium text-sm">
							Du har ubesvarte arrangementer
						</p>
						<p className="text-muted-foreground text-xs">
							Svar på oppmøte for kommende treninger og kamper.
						</p>
						<Button
							size="sm"
							variant="outline"
							className="mt-2"
							onClick={() => setIsSheetOpen(true)}
						>
							Se ubesvarte
						</Button>
					</div>
					<button
						type="button"
						onClick={handleDismiss}
						aria-label="Lukk varsling"
						className="shrink-0 rounded p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					>
						<X className="h-4 w-4" />
					</button>
				</div>
			</div>

			<Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
				<SheetContent side="bottom" className="max-h-[80dvh] overflow-y-auto">
					<SheetHeader>
						<SheetTitle>Ubesvarte arrangementer</SheetTitle>
					</SheetHeader>
					<div className="mt-4 space-y-2 pb-4">
						{unansweredEvents.map((event: UnansweredEvent) => (
							<button
								type="button"
								key={event.id}
								onClick={() => handleEventClick(event)}
								className="w-full rounded-lg border bg-card p-3 text-left transition-colors hover:bg-accent"
							>
								<div className="flex items-start justify-between gap-2">
									<div className="min-w-0 flex-1">
										<div className="truncate font-medium text-sm">
											{event.name}
										</div>
										<div className="text-muted-foreground text-xs">
											{event.team?.name ?? ""}
										</div>
									</div>
									<span className="shrink-0 text-muted-foreground text-xs">
										{getEventTypeLabel(event.eventType)}
									</span>
								</div>
								<div className="mt-1 text-muted-foreground text-xs">
									{format(new Date(event.startAt), "EEE d. MMM HH:mm", {
										locale: nb,
									})}
								</div>
							</button>
						))}
					</div>
				</SheetContent>
			</Sheet>

			<EventDialog
				event={selectedEvent}
				isOpen={isDialogOpen}
				onClose={() => {
					setIsDialogOpen(false);
					setSelectedEvent(null);
				}}
			/>
		</>
	);
}
