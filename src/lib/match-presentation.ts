import type { MatchEventType } from "@prisma/client";

export const matchEventLabels: Record<MatchEventType, string> = {
	GOAL: "Mål",
	ASSIST: "Assist",
	YELLOW_CARD: "Gult kort",
	RED_CARD: "Rødt kort",
	MOTM: "Banens beste",
};

/** Rekkefølgen hendelsene vises i, både i lister og i filtre. */
export const matchEventOrder: MatchEventType[] = [
	"GOAL",
	"ASSIST",
	"MOTM",
	"YELLOW_CARD",
	"RED_CARD",
];

export function getMatchEventLabel(type: MatchEventType): string {
	return matchEventLabels[type];
}
