import type { TeamEvent, TeamEventType } from "@prisma/client";
import { format, isSameDay } from "date-fns";
import { nb } from "date-fns/locale";
import { toAppZone } from "~/lib/datetime";

const eventTypePresentation: Record<
	TeamEventType,
	{
		label: string;
		badgeClassName: string;
	}
> = {
	// Kortet er nøytralt for alle typer, som ethvert annet kort i TIHLDE-
	// paletten. Typen bæres av badgen, og de tre tonene under er valgt fordi de
	// er de eneste som holder seg tydelig fra hverandre i både lys og mørk
	// modus uten å gå utenfor tokenene: fylt primær, dempet sekundær, invertert.
	MATCH: {
		label: "Kamp",
		badgeClassName: "bg-primary text-primary-foreground",
	},
	TRAINING: {
		label: "Trening",
		badgeClassName: "bg-secondary text-secondary-foreground",
	},
	SOCIAL: {
		label: "Sosialt",
		badgeClassName: "bg-foreground text-background",
	},
	OTHER: {
		label: "Annet",
		badgeClassName: "border border-border text-muted-foreground",
	},
};

// Skrevet ut, ikke utledet av eventTypePresentation: ellers styres rekkefølgen
// i nedtrekkene av hvilken rekkefølge fargene tilfeldigvis står i.
const eventTypeOrder: TeamEventType[] = [
	"TRAINING",
	"MATCH",
	"SOCIAL",
	"OTHER",
];

export const eventTypeOptions: { value: TeamEventType; label: string }[] =
	eventTypeOrder.map((type) => ({
		value: type,
		label: eventTypePresentation[type].label,
	}));

export type AttendanceStatusFilter =
	| "attending"
	| "notAttending"
	| "notResponded";

export const attendanceStatusOrder: AttendanceStatusFilter[] = [
	"attending",
	"notAttending",
	"notResponded",
];

export function getEventTypeLabel(type: TeamEventType): string {
	return eventTypePresentation[type]?.label ?? "Ukjent";
}

export function getEventTypeBadgeClassName(type: TeamEventType): string {
	return (
		eventTypePresentation[type]?.badgeClassName ??
		eventTypePresentation.OTHER.badgeClassName
	);
}

export function getEventDetailCardClassName(): string {
	return "bg-card text-card-foreground ring-1 ring-card-border";
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
		// Statusfargene trenger en dark:-variant nå som kortet under dem er en
		// vanlig lys/mørk flate og ikke lenger en fast mørk gradient: -600 er
		// riktig mot hvitt, men blir for dempet mot navy. Avmeldt går via
		// --destructive, som allerede har begge modusene innebygd.
		case "attending":
			return "text-green-600 dark:text-green-400";
		case "notAttending":
			return "text-destructive";
		case "notResponded":
			return "text-amber-600 dark:text-amber-400";
	}
}

export function getEventDateTime(event: Pick<TeamEvent, "startAt" | "endAt">) {
	// Arrangementene holdes i Norge, så de vises i norsk tid uansett hvor
	// leseren sitter. Uten dette ville et arrangement 18:00 norsk tid stått
	// som 12:00 for noen i New York — og på en annen dato ved midnatt.
	const startAt = toAppZone(new Date(event.startAt));
	const endAt = toAppZone(new Date(event.endAt || event.startAt));

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
