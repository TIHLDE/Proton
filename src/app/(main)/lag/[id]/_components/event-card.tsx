"use client";

import type { TeamEvent, TeamEventType } from "@prisma/client";
import { Users } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { H2 } from "~/components/ui/typography";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import EventRegistration from "./event-registration";
import NotifyUnattended from "./notify-unattended";
import RegistrationList from "./registration-list";

interface EventCardProps {
	event: TeamEvent;
	actions?: ReactNode;
	showRegistration?: boolean;
	isAdmin?: boolean;
}

const getEventTypeLabel = (type: TeamEventType): string => {
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
			return "Ukjent";
	}
};

export default function EventCard({
	event,
	actions,
	showRegistration = false,
	isAdmin = false,
}: EventCardProps) {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [selectedStatus, setSelectedStatus] = useState<
		"attending" | "notAttending" | "notResponded" | null
	>(null);

	const { data: registration } = api.registration.getMyRegistration.useQuery(
		{ eventId: event.id },
		{ enabled: showRegistration },
	);

	const { data: counts } = api.registration.getCounts.useQuery(
		{ eventId: event.id },
		{ enabled: showRegistration },
	);

	const handleStatusClick = (
		status: "attending" | "notAttending" | "notResponded",
	) => {
		setSelectedStatus(status);
		setDialogOpen(true);
	};

	return (
		<div
			className={cn(
				"space-y-4 rounded-lg p-6 text-white shadow transition-shadow hover:shadow-md",
				event.eventType === "MATCH" &&
					"bg-gradient-to-b from-[#6e2a70] to-[#4c126b]",
				event.eventType === "OTHER" && "bg-card",
				event.eventType === "SOCIAL" &&
					"bg-gradient-to-b from-[#565220] to-[#563A20]",
				event.eventType === "TRAINING" &&
					"bg-gradient-to-b from-[#3A2056] to-[#0b0941]",
			)}
		>
			<div className="flex items-center justify-between">
				<H2>{event.name}</H2>
				{actions}
			</div>
			<div className="space-y-2 text-sm">
				<p key="type">
					<strong>Type:</strong> {getEventTypeLabel(event.eventType)}
				</p>
				<p key="date">
					<strong>Fra:</strong>{" "}
					{new Date(event.startAt).toLocaleString("nb-NO")}
				</p>
				<p key="date-end">
					<strong>Til:</strong>{" "}
					{event.endAt
						? new Date(event.endAt).toLocaleString("nb-NO")
						: "Ubestemt"}
				</p>
				<p key="location">
					<strong>Sted:</strong> {event.location || "Ikke oppgitt"}
				</p>
				{event.registrationDeadline && (
					<p key="deadline">
						<strong>Påmeldingsfrist:</strong>{" "}
						{new Date(event.registrationDeadline).toLocaleString("nb-NO")}
					</p>
				)}
				{event.note ? (
					<p key="note">
						<strong>Notat:</strong> {event.note}
					</p>
				) : (
					<p key="note-empty">{"\u00A0"}</p>
				)}
			</div>

			{showRegistration && counts && (
				<div className="border-t pt-4 text-sm">
					<div className="grid grid-cols-3 gap-4">
						<button
							type="button"
							onClick={() => handleStatusClick("attending")}
							className="flex flex-col items-center gap-1 text-green-600 transition-opacity hover:opacity-80"
						>
							<Users className="h-4 w-4" />
							<span className="text-xs">Påmeldt</span>
							<span className="font-semibold">{counts.attending}</span>
						</button>
						<button
							type="button"
							onClick={() => handleStatusClick("notAttending")}
							className="flex flex-col items-center gap-1 text-red-600 transition-opacity hover:opacity-80"
						>
							<Users className="h-4 w-4" />
							<span className="text-xs">Avmeldt</span>
							<span className="font-semibold">{counts.notAttending}</span>
						</button>
						<button
							type="button"
							onClick={() => handleStatusClick("notResponded")}
							className="flex flex-col items-center gap-1 text-yellow-600 transition-opacity hover:opacity-80"
						>
							<Users className="h-4 w-4" />
							<span className="text-xs">Ikke svart</span>
							<span className="font-semibold">{counts.notResponded}</span>
						</button>
					</div>
				</div>
			)}

			{showRegistration && (
				<div className="border-t pt-4">
					<EventRegistration
						eventId={event.id}
						initialRegistration={registration}
						registrationDeadline={event.registrationDeadline}
					/>
				</div>
			)}

			{!showRegistration && <NotifyUnattended eventId={event.id} />}

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
