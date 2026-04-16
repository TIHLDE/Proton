"use client";

import type { TeamEvent } from "@prisma/client";
import { EventOverview } from "~/components/event-overview";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";

interface EventDialogProps {
	event: TeamEvent | null;
	isOpen: boolean;
	onClose: () => void;
	onSave?: (event: TeamEvent) => void;
	onDelete?: (eventId: string) => void;
}

export function EventDialog({ event, isOpen, onClose }: EventDialogProps) {
	if (!event) {
		return null;
	}

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
				<DialogHeader className="sr-only">
					<DialogTitle>{event.name}</DialogTitle>
					<DialogDescription>Event details and registration</DialogDescription>
				</DialogHeader>

				<EventOverview
					event={event}
					showAttendanceSummary={isOpen}
					showRegistration={isOpen}
				/>

				<div className="flex justify-end gap-2 border-t pt-4">
					<Button variant="outline" onClick={onClose}>
						Lukk
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
