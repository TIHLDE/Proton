"use client";

import type { TeamEvent } from "@prisma/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { type CalendarView, EventCalendar } from "~/components/event-calendar";
import { toAppZone } from "~/lib/datetime";
import { CalendarSubscribeDialog } from "./calendar-subscribe-dialog";

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

	// Kalenderen regner ut hvilken dag- og timerute et arrangement havner i med
	// vanlig date-fns-matematikk, som følger maskinens tidssone. Leses datoene
	// i norsk tid her, gjør resten av kalenderen det også — ellers ville et
	// arrangement 18:00 norsk tid lagt seg i feil kolonne for noen i utlandet.
	const zonedEvents = useMemo(
		() =>
			events.map((event) => ({
				...event,
				startAt: toAppZone(event.startAt),
				endAt: event.endAt ? toAppZone(event.endAt) : event.endAt,
			})),
		[events],
	);

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
				<div className="mb-4 flex justify-end">
					<CalendarSubscribeDialog />
				</div>
				<EventCalendar
					events={zonedEvents}
					initialView={initialView || "agenda"}
					initialDate={toAppZone(initialDate)}
					onRangeChange={handleRangeChange}
				/>
			</div>
		</div>
	);
}
