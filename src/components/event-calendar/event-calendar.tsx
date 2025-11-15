"use client";

import { RiCalendarCheckLine } from "@remixicon/react";
import {
	addDays,
	addHours,
	addMonths,
	addWeeks,
	endOfWeek,
	format,
	isSameMonth,
	startOfWeek,
	subMonths,
	subWeeks,
} from "date-fns";
import { nb } from "date-fns/locale";
import {
	ChevronDownIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	PlusIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import type { TeamEvent } from "@prisma/client";
import {
	AgendaDaysToShow,
	AgendaView,
	CalendarDndProvider,
	type CalendarView,
	DayView,
	EventDialog,
	EventGap,
	EventHeight,
	MonthView,
	WeekCellsHeight,
	WeekView,
} from "~/components/event-calendar";
import { Button } from "~/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { cn } from "~/lib/utils";

export interface EventCalendarProps {
	events?: TeamEvent[];
	onEventAdd?: (event: TeamEvent) => void;
	onEventUpdate?: (event: TeamEvent) => void;
	onEventDelete?: (eventId: string) => void;
	className?: string;
	initialView?: CalendarView;
}

export function EventCalendar({
	events = [],
	onEventAdd,
	onEventUpdate,
	onEventDelete,
	className,
	initialView = "month",
}: EventCalendarProps) {
	const [currentDate, setCurrentDate] = useState(new Date());
	const [view, setView] = useState<CalendarView>(initialView);
	const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
	const [selectedEvent, setSelectedEvent] = useState<TeamEvent | null>(null);

	// Add keyboard shortcuts for view switching
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Skip if user is typing in an input, textarea or contentEditable element
			// or if the event dialog is open
			if (
				isEventDialogOpen ||
				e.target instanceof HTMLInputElement ||
				e.target instanceof HTMLTextAreaElement ||
				(e.target instanceof HTMLElement && e.target.isContentEditable)
			) {
				return;
			}

			switch (e.key.toLowerCase()) {
				case "m":
					setView("month");
					break;
				case "w":
					setView("week");
					break;
				case "d":
					setView("day");
					break;
				case "a":
					setView("agenda");
					break;
			}
		};

		window.addEventListener("keydown", handleKeyDown);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [isEventDialogOpen]);

	const handlePrevious = () => {
		if (view === "month") {
			setCurrentDate(subMonths(currentDate, 1));
		} else if (view === "week") {
			setCurrentDate(subWeeks(currentDate, 1));
		} else if (view === "day") {
			setCurrentDate(addDays(currentDate, -1));
		} else if (view === "agenda") {
			// For agenda view, go back 30 days (a full month)
			setCurrentDate(addDays(currentDate, -AgendaDaysToShow));
		}
	};

	const handleNext = () => {
		if (view === "month") {
			setCurrentDate(addMonths(currentDate, 1));
		} else if (view === "week") {
			setCurrentDate(addWeeks(currentDate, 1));
		} else if (view === "day") {
			setCurrentDate(addDays(currentDate, 1));
		} else if (view === "agenda") {
			// For agenda view, go forward 30 days (a full month)
			setCurrentDate(addDays(currentDate, AgendaDaysToShow));
		}
	};

	const handleToday = () => {
		setCurrentDate(new Date());
	};

	const handleEventSelect = (event: TeamEvent) => {
		setSelectedEvent(event);
		setIsEventDialogOpen(true);
	};

	// TODO: Fix this to add new event
	const handleEventCreate = (startTime: Date) => {};

	// TODO: Fix this to save new or updated event
	const handleEventSave = (event: TeamEvent) => {};

	const handleEventDelete = (eventId: string) => {
		const deletedEvent = events.find((e) => e.id === eventId);
		onEventDelete?.(eventId);
		setIsEventDialogOpen(false);
		setSelectedEvent(null);

		// Show toast notification when an event is deleted
		if (deletedEvent) {
			toast(`Hendelse "${deletedEvent.name}" ble slettet`, {
				description: format(new Date(deletedEvent.startAt), "d. MMM yyyy", {
					locale: nb,
				}),
				position: "bottom-left",
			});
		}
	};

	const handleEventUpdate = (updatedEvent: TeamEvent) => {
		onEventUpdate?.(updatedEvent);

		// Show toast notification when an event is updated via drag and drop
		toast(`Hendelse "${updatedEvent.name}" flyttet`, {
			description: format(new Date(updatedEvent.startAt), "d. MMM yyyy", {
				locale: nb,
			}),
			position: "bottom-left",
		});
	};

	const viewTitle = useMemo(() => {
		if (view === "month") {
			return format(currentDate, "MMMM yyyy", { locale: nb });
		} else if (view === "week") {
			const start = startOfWeek(currentDate, { weekStartsOn: 0 });
			const end = endOfWeek(currentDate, { weekStartsOn: 0 });
			if (isSameMonth(start, end)) {
				return format(start, "MMMM yyyy", { locale: nb });
			} else {
				return `${format(start, "MMM", { locale: nb })} - ${format(end, "MMM yyyy", { locale: nb })}`;
			}
		} else if (view === "day") {
			return (
				<>
					<span className="min-[480px]:hidden" aria-hidden="true">
						{format(currentDate, "d. MMM yyyy", { locale: nb })}
					</span>
					<span className="max-[479px]:hidden min-md:hidden" aria-hidden="true">
						{format(currentDate, "d. MMMM yyyy", { locale: nb })}
					</span>
					<span className="max-md:hidden">
						{format(currentDate, "EEEE d. MMMM yyyy", { locale: nb })}
					</span>
				</>
			);
		} else if (view === "agenda") {
			// Show the month range for agenda view
			const start = currentDate;
			const end = addDays(currentDate, AgendaDaysToShow - 1);

			if (isSameMonth(start, end)) {
				return format(start, "MMMM yyyy", { locale: nb });
			} else {
				return `${format(start, "MMM", { locale: nb })} - ${format(end, "MMM yyyy", { locale: nb })}`;
			}
		} else {
			return format(currentDate, "MMMM yyyy", { locale: nb });
		}
	}, [currentDate, view]);

	return (
		<div
			className="flex flex-col rounded-lg border has-data-[slot=month-view]:flex-1"
			style={
				{
					"--event-height": `${EventHeight}px`,
					"--event-gap": `${EventGap}px`,
					"--week-cells-height": `${WeekCellsHeight}px`,
				} as React.CSSProperties
			}
		>
			<CalendarDndProvider onEventUpdate={handleEventUpdate}>
				<div
					className={cn(
						"flex items-center justify-between p-2 sm:p-4",
						className,
					)}
				>
					<div className="flex items-center gap-1 sm:gap-4">
						<Button
							variant="outline"
							className="max-[479px]:aspect-square max-[479px]:p-0!"
							onClick={handleToday}
						>
							<RiCalendarCheckLine
								className="min-[480px]:hidden"
								size={16}
								aria-hidden="true"
							/>
							<span className="max-[479px]:sr-only">I dag</span>
						</Button>
						<div className="flex items-center sm:gap-2">
							<Button
								variant="ghost"
								size="icon"
								onClick={handlePrevious}
								aria-label="Forrige"
							>
								<ChevronLeftIcon size={16} aria-hidden="true" />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								onClick={handleNext}
								aria-label="Neste"
							>
								<ChevronRightIcon size={16} aria-hidden="true" />
							</Button>
						</div>
						<h2 className="font-semibold text-sm sm:text-lg md:text-xl">
							{viewTitle}
						</h2>
					</div>
					<div className="flex items-center gap-2">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" className="gap-1.5 max-[479px]:h-8">
									<span>
										<span className="min-[480px]:hidden" aria-hidden="true">
											{view === "day"
												? "Dag"
												: view === "week"
													? "Uke"
													: view === "month"
														? "Måned"
														: "Agenda"}
										</span>
										<span className="max-[479px]:sr-only">
											{view === "day"
												? "Dag"
												: view === "week"
													? "Uke"
													: view === "month"
														? "Måned"
														: "Agenda"}
										</span>
									</span>
									<ChevronDownIcon
										className="-me-1 opacity-60"
										size={16}
										aria-hidden="true"
									/>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="min-w-32">
								<DropdownMenuItem onClick={() => setView("month")}>
									Måned <DropdownMenuShortcut>M</DropdownMenuShortcut>
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => setView("week")}>
									Uke <DropdownMenuShortcut>U</DropdownMenuShortcut>
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => setView("day")}>
									Dag <DropdownMenuShortcut>D</DropdownMenuShortcut>
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => setView("agenda")}>
									Agenda <DropdownMenuShortcut>A</DropdownMenuShortcut>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
						<Button
							className="max-[479px]:aspect-square max-[479px]:p-0!"
							onClick={() => {
								setSelectedEvent(null); // Ensure we're creating a new event
								setIsEventDialogOpen(true);
							}}
						>
							<PlusIcon
								className="sm:-ms-1 opacity-60"
								size={16}
								aria-hidden="true"
							/>
							<span className="max-sm:sr-only">Ny hendelse</span>
						</Button>
					</div>
				</div>

				<div className="flex flex-1 flex-col">
					{view === "month" && (
						<MonthView
							currentDate={currentDate}
							events={events}
							onEventSelect={handleEventSelect}
							onEventCreate={handleEventCreate}
						/>
					)}
					{view === "week" && (
						<WeekView
							currentDate={currentDate}
							events={events}
							onEventSelect={handleEventSelect}
							onEventCreate={handleEventCreate}
						/>
					)}
					{view === "day" && (
						<DayView
							currentDate={currentDate}
							events={events}
							onEventSelect={handleEventSelect}
							onEventCreate={handleEventCreate}
						/>
					)}
					{view === "agenda" && (
						<AgendaView
							currentDate={currentDate}
							events={events}
							onEventSelect={handleEventSelect}
						/>
					)}
				</div>

				<EventDialog
					event={selectedEvent}
					isOpen={isEventDialogOpen}
					onClose={() => {
						setIsEventDialogOpen(false);
						setSelectedEvent(null);
					}}
					onSave={handleEventSave}
					onDelete={handleEventDelete}
				/>
			</CalendarDndProvider>
		</div>
	);
}
