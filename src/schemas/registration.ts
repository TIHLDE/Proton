import { z } from "zod";

export const registrationTypeEnum = z.enum(["ATTENDING", "NOT_ATTENDING"]);

export const createRegistrationSchema = z.object({
	eventId: z.string().min(1, "Event ID er påkrevd"),
	type: registrationTypeEnum,
	comment: z.string().optional(),
});

export const updateRegistrationSchema = z.object({
	id: z.string().min(1, "ID er påkrevd"),
	type: registrationTypeEnum,
	comment: z.string().optional(),
});

export const getRegistrationByEventSchema = z.object({
	eventId: z.string().min(1, "Event ID er påkrevd"),
});

export const deleteRegistrationSchema = z.object({
	id: z.string().min(1, "ID er påkrevd"),
});

export const adminUpdateRegistrationSchema = z.object({
	userId: z.string().min(1, "User ID er påkrevd"),
	eventId: z.string().min(1, "Event ID er påkrevd"),
	type: registrationTypeEnum,
	comment: z.string().optional(),
});

export type CreateRegistrationInput = z.infer<typeof createRegistrationSchema>;
export type UpdateRegistrationInput = z.infer<typeof updateRegistrationSchema>;
export type GetRegistrationByEventInput = z.infer<
	typeof getRegistrationByEventSchema
>;
export type DeleteRegistrationInput = z.infer<typeof deleteRegistrationSchema>;
export type AdminUpdateRegistrationInput = z.infer<
	typeof adminUpdateRegistrationSchema
>;

export const notifyUnattendedEventRegistrationSchema = z.object({
	eventId: z.string().min(1, "Event ID er påkrevd"),
	teamId: z.string().min(1, "Team ID er påkrevd"),
});
