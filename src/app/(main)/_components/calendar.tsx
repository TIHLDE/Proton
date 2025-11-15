"use client";

import type { TeamEvent } from "@prisma/client";
import { EventCalendar } from "~/components/event-calendar";

interface MyCalendarProps {
	events: TeamEvent[];
}

export default function MyCalendar({ events }: MyCalendarProps) {
	return (
		<div className="w-full px-2 py-20 md:px-6 md:py-32 lg:px-12">
			<div className="mx-auto w-full max-w-5xl">
				<EventCalendar events={events} initialView="week" />
			</div>
		</div>
	);
}
