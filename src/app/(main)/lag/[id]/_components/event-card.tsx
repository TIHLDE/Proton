"use client";

import type { TeamEvent } from "@prisma/client";
import type { ReactNode } from "react";
import { useState } from "react";
import { EventOverview } from "~/components/event-overview";
import {
	type AttendanceStatusFilter,
	getEventDetailCardClassName,
	getEventDetailSurface,
} from "~/lib/event-presentation";
import { cn } from "~/lib/utils";
import NotifyUnattended from "./notify-unattended";
import RegistrationList from "./registration-list";

interface EventCardProps {
	event: TeamEvent;
	actions?: ReactNode;
	showRegistration?: boolean;
	isAdmin?: boolean;
}

export default function EventCard({
	event,
	actions,
	showRegistration = false,
	isAdmin = false,
}: EventCardProps) {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [selectedStatus, setSelectedStatus] =
		useState<AttendanceStatusFilter | null>(null);

	const handleStatusClick = (status: AttendanceStatusFilter) => {
		setSelectedStatus(status);
		setDialogOpen(true);
	};

	const surface = getEventDetailSurface(event.eventType);

	return (
		<div
			className={cn(
				"rounded-lg p-6 shadow transition-shadow hover:shadow-md",
				getEventDetailCardClassName(event.eventType),
			)}
		>
			<EventOverview
				event={event}
				headerActions={actions}
				surface={surface}
				showAttendanceSummary={showRegistration}
				showRegistration={showRegistration}
				onAttendanceStatusClick={handleStatusClick}
				footer={
					!showRegistration ? <NotifyUnattended eventId={event.id} /> : null
				}
			/>

			<RegistrationList
				eventId={event.id}
				eventName={event.name}
				open={dialogOpen}
				onOpenChange={setDialogOpen}
				statusFilter={selectedStatus}
				isAdmin={isAdmin}
			/>
		</div>
	);
}
