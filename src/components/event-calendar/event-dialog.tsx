"use client";

import type { TeamEvent } from "@prisma/client";
import { useState } from "react";
import { EventOverview } from "~/components/event-overview";
import RegistrationList from "~/components/registration-list";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import type { AttendanceStatusFilter } from "~/lib/event-presentation";

interface EventDialogProps {
	event: TeamEvent | null;
	isOpen: boolean;
	onClose: () => void;
	onSave?: (event: TeamEvent) => void;
	onDelete?: (eventId: string) => void;
}

export function EventDialog({ event, isOpen, onClose }: EventDialogProps) {
	const [attendanceListOpen, setAttendanceListOpen] = useState(false);
	const [selectedStatus, setSelectedStatus] =
		useState<AttendanceStatusFilter | null>(null);

	if (!event) {
		return null;
	}

	const handleStatusClick = (status: AttendanceStatusFilter) => {
		setSelectedStatus(status);
		setAttendanceListOpen(true);
	};

	return (
		<>
			<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
				<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
					<DialogHeader className="sr-only">
						<DialogTitle>{event.name}</DialogTitle>
						<DialogDescription>
							Event details and registration
						</DialogDescription>
					</DialogHeader>

					<EventOverview
						event={event}
						showAttendanceSummary={isOpen}
						showRegistration={isOpen}
						onAttendanceStatusClick={handleStatusClick}
					/>

					<div className="flex justify-end gap-2 border-t pt-4">
						<Button variant="outline" onClick={onClose}>
							Lukk
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			<RegistrationList
				eventId={event.id}
				eventName={event.name}
				open={attendanceListOpen}
				onOpenChange={setAttendanceListOpen}
				statusFilter={selectedStatus}
			/>
		</>
	);
}
