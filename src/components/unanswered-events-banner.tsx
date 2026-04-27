"use client";

import type { TeamEvent } from "@prisma/client";
import { ListChecks, X } from "lucide-react";
import { useEffect, useState } from "react";
import { EventDialog } from "~/components/event-calendar/event-dialog";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";

const SESSION_KEY = "unanswered-events-banner-dismissed";

export function UnansweredEventsBanner() {
	const { data: unansweredEvents } = api.event.getUnanswered.useQuery();
	const [dismissed, setDismissed] = useState(true);
	const [selectedEvent, setSelectedEvent] = useState<TeamEvent | null>(null);
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	useEffect(() => {
		const isDismissed = sessionStorage.getItem(SESSION_KEY) === "true";
		setDismissed(isDismissed);
	}, []);

	const handleDismiss = () => {
		sessionStorage.setItem(SESSION_KEY, "true");
		setDismissed(true);
	};

	const handleOpen = () => {
		if (!unansweredEvents || unansweredEvents.length === 0) return;
		setSelectedEvent(unansweredEvents[0]);
		setIsDialogOpen(true);
	};

	if (dismissed || !unansweredEvents || unansweredEvents.length === 0) {
		return null;
	}

	const count = unansweredEvents.length;

	return (
		<>
			<div className="mx-auto w-full max-w-7xl px-2 pt-4 lg:px-12">
				<div className="flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900 shadow-sm dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
					<div className="flex min-w-0 items-center gap-3">
						<ListChecks className="h-5 w-5 shrink-0" />
						<div className="min-w-0">
							<p className="font-medium text-sm leading-tight">
								Du har {count} ubesvart{count === 1 ? "" : "e"} arrangement
								{count === 1 ? "" : "er"}
							</p>
							<p className="text-xs opacity-80">
								Svar på oppmøte for kommende treninger og kamper.
							</p>
						</div>
					</div>
					<div className="flex shrink-0 items-center gap-1">
						<Button
							size="sm"
							variant="outline"
							className="h-8 border-amber-300 bg-amber-100 text-amber-900 hover:bg-amber-200 hover:text-amber-900 dark:border-amber-700 dark:bg-amber-900/50 dark:text-amber-100 dark:hover:bg-amber-800"
							onClick={handleOpen}
						>
							Se ubesvarte
						</Button>
						<Button
							size="icon"
							variant="ghost"
							className="h-8 w-8 text-amber-700 hover:bg-amber-100 hover:text-amber-900 dark:text-amber-400 dark:hover:bg-amber-900 dark:hover:text-amber-200"
							onClick={handleDismiss}
							aria-label="Lukk varsling"
						>
							<X className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</div>

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
