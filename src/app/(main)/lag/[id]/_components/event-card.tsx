"use client";

import type { TeamEvent } from "@prisma/client";
import type { ReactNode } from "react";
import { useState } from "react";
import { EventOverview } from "~/components/event-overview";
import { Button } from "~/components/ui/button";
import {
	type AttendanceStatusFilter,
	getEventDetailCardClassName,
	getEventDetailSurface,
} from "~/lib/event-presentation";
import { cn } from "~/lib/utils";
import ConfirmEventAttendance from "./confirm-event-attendance";
import MatchStats from "./match-stats";
import NotifyUnattended from "./notify-unattended";
import RegistrationList from "./registration-list";

interface EventCardProps {
	event: TeamEvent;
	actions?: ReactNode;
	showRegistration?: boolean;
	isAdmin?: boolean;
	teamName?: string;
}

export default function EventCard({
	event,
	actions,
	showRegistration = false,
	isAdmin = false,
	teamName = "Oss",
}: EventCardProps) {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [confirmAttendanceOpen, setConfirmAttendanceOpen] = useState(false);
	const [selectedStatus, setSelectedStatus] =
		useState<AttendanceStatusFilter | null>(null);
	const [matchStatsOpen, setMatchStatsOpen] = useState(false);

	const now = new Date();
	const isPastEvent = new Date(event.endAt ?? event.startAt) < now;

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
					isAdmin && !isPastEvent ? (
						<NotifyUnattended eventId={event.id} />
					) : null
				}
			/>

			{event.eventType === "MATCH" && (
				<div className="border-t pt-6">
					<Button
						type="button"
						variant="outline"
						className={cn(
							"w-full",
							"border-white/80 bg-white/10 text-white hover:bg-white/20 hover:text-white",
						)}
						onClick={() => setMatchStatsOpen(true)}
					>
						Kampfakta
					</Button>
				</div>
			)}

			{isPastEvent && (
				<div className="border-t pt-6">
					<Button
						type="button"
						variant="outline"
						className={cn(
							"w-full",
							event.eventType !== "OTHER" &&
								"border-white/80 bg-white/10 text-white hover:bg-white/20 hover:text-white",
						)}
						onClick={() => setConfirmAttendanceOpen(true)}
					>
						{isAdmin ? "Bekreft oppmøte" : "Se oppmøte"}
					</Button>
				</div>
			)}

			<ConfirmEventAttendance
				eventId={event.id}
				eventName={event.name}
				open={confirmAttendanceOpen}
				onOpenChange={setConfirmAttendanceOpen}
				isAdmin={isAdmin}
			/>

			{event.eventType === "MATCH" && (
				<MatchStats
					eventId={event.id}
					eventName={event.name}
					teamName={teamName}
					isAdmin={isAdmin}
					open={matchStatsOpen}
					onOpenChange={setMatchStatsOpen}
				/>
			)}

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
