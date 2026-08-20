import z from "zod";

export const MATCH_EVENT_TYPES = [
	"GOAL",
	"ASSIST",
	"YELLOW_CARD",
	"RED_CARD",
	"MOTM",
] as const;

export const GetMatchSchema = z.object({
	eventId: z.string().min(1, { message: "Arrangement ID er påkrevd" }),
});

export const SaveMatchResultSchema = z.object({
	eventId: z.string().min(1, { message: "Arrangement ID er påkrevd" }),
	homeGoals: z.coerce
		.number()
		.int({ message: "Må være et helt tall" })
		.min(0, { message: "Kan ikke være negativt" })
		.max(99, { message: "Høyeste er 99" }),
	awayGoals: z.coerce
		.number()
		.int({ message: "Må være et helt tall" })
		.min(0, { message: "Kan ikke være negativt" })
		.max(99, { message: "Høyeste er 99" }),
});

export const AddMatchEventSchema = z.object({
	eventId: z.string().min(1, { message: "Arrangement ID er påkrevd" }),
	userId: z.string().min(1, { message: "Du må velge en spiller" }),
	type: z.enum(MATCH_EVENT_TYPES),
});

export const DeleteMatchEventSchema = z.object({
	matchEventId: z.string().min(1, { message: "Hendelse ID er påkrevd" }),
});
