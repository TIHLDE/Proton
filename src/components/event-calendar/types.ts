import type { Team, TeamEvent } from "@prisma/client";
import type { RegistrationCounts } from "~/services/registration";

export type CalendarView = "month" | "week" | "day" | "agenda";

export type TeamSummary = Pick<
	Team,
	"id" | "name" | "category" | "logoUrl" | "emoji"
>;

// Agendaen viser lagets navn, logo, fargekategori og oppmøtetall per
// arrangement, i motsetning til måned-/uke-/dagvisningene som klarer seg med
// rene TeamEvent-felt. Begge er valgfrie nettopp derfor - de andre
// visningene sender dem aldri med.
export type TeamEventWithTeam = TeamEvent & {
	team: TeamSummary;
	registrationCounts?: RegistrationCounts;
};

export interface CalendarEvent {
	id: string;
	title: string;
	description?: string;
	start: Date;
	end: Date;
	allDay?: boolean;
	color?: EventColor;
	location?: string;
}

export type EventColor =
	| "sky"
	| "amber"
	| "violet"
	| "rose"
	| "emerald"
	| "orange";
