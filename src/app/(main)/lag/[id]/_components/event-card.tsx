"use client";

import type { TeamEvent, TeamEventType } from "@prisma/client";
import { Users } from "lucide-react";
import type { ReactNode } from "react";
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
}: EventCardProps) {
	const { data: registration } = api.registration.getMyRegistration.useQuery(
		{ eventId: event.id },
		{ enabled: showRegistration },
	);

	const { data: counts } = api.registration.getCounts.useQuery(
		{ eventId: event.id },
		{ enabled: showRegistration },
	);

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
				<p>
					<strong>Type:</strong> {getEventTypeLabel(event.eventType)}
				</p>
				<p>
					<strong>Dato:</strong>{" "}
					{new Date(event.startAt).toLocaleString("nb-NO")}
				</p>
				<p>
					<strong>Sted:</strong> {event.location || "Ikke oppgitt"}
				</p>
				{event.note ? (
					<p>
						<strong>Notat:</strong> {event.note}
					</p>
				) : (
					<p>{"\u00A0"}</p>
				)}
			</div>

			{showRegistration && counts && (
				<div className="flex items-center justify-between border-t pt-4 text-sm">
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-2 text-green-600">
							<Users className="h-4 w-4" />
							<span>{counts.attending} kommer</span>
						</div>
						<div className="flex items-center gap-2 text-red-600">
							<Users className="h-4 w-4" />
							<span>{counts.notAttending} kommer ikke</span>
						</div>
					</div>
					<RegistrationList eventId={event.id} eventName={event.name} />
				</div>
			)}

			{showRegistration && (
				<div className="border-t pt-4">
					<EventRegistration
						eventId={event.id}
						initialRegistration={registration}
					/>
				</div>
			)}

			{!showRegistration && <NotifyUnattended eventId={event.id} />}
		</div>
	);
}
