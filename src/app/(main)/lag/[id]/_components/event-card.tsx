"use client";

import { Users } from "lucide-react";
import type { ReactNode } from "react";
import { H2 } from "~/components/ui/typography";
import { api } from "~/trpc/react";
import EventRegistration from "./event-registration";
import NotifyUnattended from "./notify-unattended";
import RegistrationList from "./registration-list";

interface EventCardProps {
	event: {
		id: string;
		name: string;
		type: string;
		datetime: Date | string;
		location: string | null;
		note: string | null;
	};
	actions?: ReactNode;
	showRegistration?: boolean;
}

const getEventTypeLabel = (type: string): string => {
	const typeMap: Record<string, string> = {
		TRAINING: "Trening",
		MATCH: "Kamp",
		SOCIAL: "Sosialt",
		OTHER: "Annet",
	};
	return typeMap[type] || type;
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
		<div className="space-y-4 rounded-lg border bg-card p-6 shadow transition-shadow hover:shadow-md">
			<div className="flex items-center justify-between">
				<H2>{event.name}</H2>
				{actions}
			</div>
			<div className="space-y-2 text-muted-foreground text-sm">
				<p>
					<strong>Type:</strong> {getEventTypeLabel(event.type)}
				</p>
				<p>
					<strong>Dato:</strong>{" "}
					{new Date(event.datetime).toLocaleString("nb-NO")}
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
