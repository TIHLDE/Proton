import type { TeamEvent, TeamEventType } from "@prisma/client";
import { format, isSameDay } from "date-fns";
import { nb } from "date-fns/locale";

export type AttendanceStatusFilter =
	| "attending"
	| "notAttending"
	| "notResponded";

export type EventOverviewSurface = "default" | "inverse";

export const attendanceStatusOrder: AttendanceStatusFilter[] = [
	"attending",
	"notAttending",
	"notResponded",
];

const eventTypePresentation: Record<
	TeamEventType,
	{
		label: string;
		badgeClassName: string;
		cardClassName: string;
		surface: EventOverviewSurface;
	}
> = {
	MATCH: {
		label: "Kamp",
		badgeClassName: "bg-gradient-to-b from-[#6e2a70] to-[#4c126b]",
		cardClassName: "bg-gradient-to-b from-[#6e2a70] to-[#4c126b] text-white",
		surface: "inverse",
	},
	TRAINING: {
		label: "Trening",
		badgeClassName: "bg-gradient-to-b from-[#3A2056] to-[#0b0941]",
		cardClassName: "bg-gradient-to-b from-[#3A2056] to-[#0b0941] text-white",
		surface: "inverse",
	},
	SOCIAL: {
		label: "Sosialt",
		badgeClassName: "bg-gradient-to-b from-[#565220] to-[#563A20]",
		cardClassName: "bg-gradient-to-b from-[#565220] to-[#563A20] text-white",
		surface: "inverse",
	},
	OTHER: {
		label: "Annet",
		badgeClassName: "border bg-card text-card-foreground",
		cardClassName: "border bg-card text-card-foreground",
		surface: "default",
	},
};

export function getEventTypeLabel(type: TeamEventType): string {
	return eventTypePresentation[type]?.label ?? "Ukjent";
}

export function getEventTypeBadgeClassName(type: TeamEventType): string {
	return (
		eventTypePresentation[type]?.badgeClassName ??
		eventTypePresentation.OTHER.badgeClassName
	);
}

export function getEventDetailCardClassName(type: TeamEventType): string {
	return (
		eventTypePresentation[type]?.cardClassName ??
		eventTypePresentation.OTHER.cardClassName
	);
}

export function getEventDetailSurface(
	type: TeamEventType,
): EventOverviewSurface {
	return eventTypePresentation[type]?.surface ?? "default";
}

export function getAttendanceStatusLabel(
	status: AttendanceStatusFilter,
): string {
	switch (status) {
		case "attending":
			return "Påmeldt";
		case "notAttending":
			return "Avmeldt";
		case "notResponded":
			return "Ikke svart";
	}
}

export function getAttendanceStatusTextClassName(
	status: AttendanceStatusFilter,
): string {
	switch (status) {
		case "attending":
			return "text-green-600";
		case "notAttending":
			return "text-red-600";
		case "notResponded":
			return "text-yellow-600";
	}
}

export function getAttendanceStatusAccentClassName(
	status: AttendanceStatusFilter,
	surface: EventOverviewSurface,
): string {
	switch (status) {
		case "attending":
			return surface === "inverse" ? "text-emerald-200" : "text-emerald-600";
		case "notAttending":
			return surface === "inverse" ? "text-rose-200" : "text-rose-600";
		case "notResponded":
			return surface === "inverse" ? "text-amber-200" : "text-amber-600";
	}
}

export function getEventDateTime(event: Pick<TeamEvent, "startAt" | "endAt">) {
	const startAt = new Date(event.startAt);
	const endAt = new Date(event.endAt || event.startAt);

	if (isSameDay(startAt, endAt)) {
		return {
			primary: format(startAt, "EEEE d. MMMM yyyy", { locale: nb }),
			secondary: `${format(startAt, "HH:mm", { locale: nb })} - ${format(endAt, "HH:mm", { locale: nb })}`,
		};
	}

	return {
		primary: `Fra ${format(startAt, "EEEE d. MMMM yyyy 'kl.' HH:mm", {
			locale: nb,
		})}`,
		secondary: `Til ${format(endAt, "EEEE d. MMMM yyyy 'kl.' HH:mm", {
			locale: nb,
		})}`,
	};
}
