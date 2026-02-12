"use client";

import type { TeamEvent } from "@prisma/client";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { ListChecks } from "lucide-react";
import { useState } from "react";
import { EventDialog } from "~/components/event-calendar/event-dialog";
import { Button } from "~/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
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

export default function UnansweredEventsDropdown() {
	const { data: unansweredEvents } = api.event.getUnanswered.useQuery();
	const [selectedEvent, setSelectedEvent] = useState<TeamEvent | null>(null);
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const handleEventClick = (event: TeamEvent & { team?: { name: string } }) => {
		setSelectedEvent(event);
		setIsDialogOpen(true);
	};

	const unansweredCount = unansweredEvents?.length || 0;

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						size="icon"
						variant="ghost"
						className="relative h-8 w-8 sm:h-10 sm:w-10"
					>
						<ListChecks className="h-[1rem] w-[1rem] sm:h-[1.2rem] sm:w-[1.2rem]" />
						{unansweredCount > 0 && (
							<span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
								{unansweredCount > 9 ? "9+" : unansweredCount}
							</span>
						)}
						<span className="sr-only">Ubesvarte events</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-80">
					<DropdownMenuLabel>Ubesvarte events</DropdownMenuLabel>
					<DropdownMenuSeparator />
					{!unansweredEvents || unansweredEvents.length === 0 ? (
						<div className="p-4 text-center text-muted-foreground text-sm">
							Ingen ubesvarte events
						</div>
					) : (
						<div className="max-h-[400px] overflow-y-auto">
							{unansweredEvents.map(
								(event: TeamEvent & { team?: { name: string } }) => (
									<DropdownMenuItem
										key={event.id}
										onClick={() => handleEventClick(event)}
										className="cursor-pointer flex-col items-start gap-1 p-3"
									>
										<div className="flex w-full items-start justify-between gap-2">
											<div className="flex-1">
												<div className="font-medium text-sm">{event.name}</div>
												<div className="text-muted-foreground text-xs">
													{"team" in event &&
													event.team &&
													typeof event.team === "object" &&
													"name" in event.team
														? (event.team as { name: string }).name
														: ""}
												</div>
											</div>
											<span className="whitespace-nowrap text-muted-foreground text-xs">
												{getEventTypeLabel(event.eventType)}
											</span>
										</div>
										<div className="text-muted-foreground text-xs">
											{format(new Date(event.startAt), "EEE d. MMM HH:mm", {
												locale: nb,
											})}
										</div>
									</DropdownMenuItem>
								),
							)}
						</div>
					)}
				</DropdownMenuContent>
			</DropdownMenu>

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
