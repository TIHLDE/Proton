import type { TeamEvent, TeamEventType } from "@prisma/client";
import { format, isSameDay } from "date-fns";
import { nb } from "date-fns/locale";
import { toAppZone } from "~/lib/datetime";

const eventTypePresentation: Record<
	TeamEventType,
	{
		label: string;
		badgeClassName: string;
		emoji: string;
		// Vinklede 3-stopp-gradienter, faste per arrangementstype uavhengig av
		// hvilket lag arrangementet tilhører. Trening/Annet gjenbruker bevisst
		// samme HEX-verdier som gruppefargene til hhv. Pythons og vanlige
		// TIHLDE-lag (se team-presentation.ts) - resten av paletten (Kamp,
		// Sosialt) finnes bare her.
		gradient: string;
		// Samme HEX som gradientens 0%-stopp, til steder en gradient ikke er
		// mulig (tekst/ikonfarge - `color` støtter ikke gradienter).
		accentColor: string;
	}
> = {
	// Kortet er nøytralt for alle typer, som ethvert annet kort i TIHLDE-
	// paletten. Typen bæres av badgen, og de tre tonene under er valgt fordi de
	// er de eneste som holder seg tydelig fra hverandre i både lys og mørk
	// modus uten å gå utenfor tokenene: fylt primær, dempet sekundær, invertert.
	MATCH: {
		label: "Kamp",
		badgeClassName: "bg-primary text-primary-foreground",
		emoji: "🏆",
		gradient: "linear-gradient(135deg, #D746AE 0%, #71254C 50%, #D746AE 100%)",
		accentColor: "#D746AE",
	},
	TRAINING: {
		label: "Trening",
		badgeClassName: "bg-secondary text-secondary-foreground",
		emoji: "🏋️",
		gradient: "linear-gradient(135deg, #8346D7 0%, #452571 50%, #8346D7 100%)",
		accentColor: "#8346D7",
	},
	SOCIAL: {
		label: "Sosialt",
		badgeClassName: "bg-foreground text-background",
		emoji: "🎉",
		gradient: "linear-gradient(135deg, #D7CD46 0%, #6F7125 50%, #D7CD46 100%)",
		accentColor: "#D7CD46",
	},
	OTHER: {
		label: "Annet",
		badgeClassName: "border border-border text-muted-foreground",
		emoji: "📌",
		gradient: "linear-gradient(135deg, #005CFF 0%, #20478C 50%, #005CFF 100%)",
		accentColor: "#005CFF",
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

export function getEventTypeEmoji(type: TeamEventType): string {
	return (
		eventTypePresentation[type]?.emoji ?? eventTypePresentation.OTHER.emoji
	);
}

export function getEventTypeGradient(type: TeamEventType): string {
	return (
		eventTypePresentation[type]?.gradient ??
		eventTypePresentation.OTHER.gradient
	);
}

// rgba(...) med gitt alpha av aksentfargen - til nedtonede bakgrunner
// (måned-/uke-/dagvisningens ruter) der en full gradient ville vært for
// dominerende, men fargen fortsatt skal gå igjen.
export function getEventTypeTintedBackground(
	type: TeamEventType,
	alpha: number,
): string {
	const hex = getEventTypeAccentColor(type);
	const r = Number.parseInt(hex.slice(1, 3), 16);
	const g = Number.parseInt(hex.slice(3, 5), 16);
	const b = Number.parseInt(hex.slice(5, 7), 16);
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function getEventTypeAccentColor(type: TeamEventType): string {
	return (
		eventTypePresentation[type]?.accentColor ??
		eventTypePresentation.OTHER.accentColor
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
