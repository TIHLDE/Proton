"use client";

import { RiCalendarEventLine } from "@remixicon/react";
import { addDays, format, isToday } from "date-fns";
import { nb } from "date-fns/locale";
import { useMemo } from "react";

import type { TeamEvent } from "@prisma/client";
import {
	AgendaDaysToShow,
	EventItem,
	getAgendaEventsForDay,
} from "~/components/event-calendar";

interface AgendaViewProps {
	currentDate: Date;
	events: TeamEvent[];
	onEventSelect: (event: TeamEvent) => void;
}

export function AgendaView({
	currentDate,
	events,
	onEventSelect,
}: AgendaViewProps) {
	// Show events for the next days based on constant
	const days = useMemo(() => {
		console.log("Agenda view updating with date:", currentDate.toISOString());
		return Array.from({ length: AgendaDaysToShow }, (_, i) =>
			addDays(new Date(currentDate), i),
		);
	}, [currentDate]);

	const handleEventClick = (event: TeamEvent, e: React.MouseEvent) => {
		e.stopPropagation();
		console.log("Agenda view event clicked:", event);
		onEventSelect(event);
	};

	// Check if there are any days with events
	const hasEvents = days.some(
		(day) => getAgendaEventsForDay(events, day).length > 0,
	);

	return (
		<div className="border-border/70 border-t px-4">
			{!hasEvents ? (
				<div className="flex min-h-[70svh] flex-col items-center justify-center py-16 text-center">
					<RiCalendarEventLine
						size={32}
						className="mb-2 text-muted-foreground/50"
					/>
					<h3 className="font-medium text-lg">Ingen hendelser funnet</h3>
					<p className="text-muted-foreground">
						Det er ingen hendelser planlagt for denne perioden.
					</p>
				</div>
			) : (
				days.map((day) => {
					const dayEvents = getAgendaEventsForDay(events, day);

					if (dayEvents.length === 0) return null;

					return (
						<div
							key={day.toString()}
							className="relative my-12 border-border/70 border-t"
						>
							<span
								className="-top-3 absolute left-0 flex h-6 items-center bg-background pe-4 text-[10px] uppercase data-today:font-medium sm:pe-4 sm:text-xs"
								data-today={isToday(day) || undefined}
							>
								{format(day, "EEEE d. MMMM", { locale: nb })}
							</span>
							<div className="mt-6 space-y-2">
								{dayEvents.map((event) => (
									<EventItem
										key={event.id}
										event={event}
										view="agenda"
										onClick={(e) => handleEventClick(event, e)}
									/>
								))}
							</div>
						</div>
					);
				})
			)}
		</div>
	);
}
