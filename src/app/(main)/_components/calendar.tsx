"use client";

import type { TeamEvent } from "@prisma/client";
import { useRouter, useSearchParams } from "next/navigation";
import { type CalendarView, EventCalendar } from "~/components/event-calendar";

interface MyCalendarProps {
	events: TeamEvent[];
	initialDate: Date;
	initialView?: CalendarView | undefined;
}

export default function MyCalendar({
	events,
	initialDate,
	initialView,
}: MyCalendarProps) {
	const router = useRouter();
	const searchParams = useSearchParams();

	const handleRangeChange = (start: Date, end: Date, view: CalendarView) => {
		const newStart = start.toISOString();
		const newEnd = end.toISOString();
		const newView = view;

		const currentStart = searchParams.get("start");
		const currentEnd = searchParams.get("end");
		const currentView = searchParams.get("view") || undefined;

		// Avoid redundant navigation that can cause scroll jitter
		if (
			currentStart === newStart &&
			currentEnd === newEnd &&
			currentView === newView
		) {
			return;
		}

		router.replace(
			`/?start=${encodeURIComponent(newStart)}&end=${encodeURIComponent(newEnd)}&view=${encodeURIComponent(newView)}`,
		);
	};

	return (
		<div className="w-full px-2 py-20 md:px-6 md:py-32 lg:px-12">
			<div className="mx-auto w-full max-w-7xl">
				<EventCalendar
					events={events}
					initialView={initialView || "agenda"}
					initialDate={initialDate}
					onRangeChange={handleRangeChange}
				/>
			</div>
		</div>
	);
}
