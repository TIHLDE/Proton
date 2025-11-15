import z from "zod";

export const CreateEventInputSchema = z
	.object({
		teamId: z.string().min(1, { message: "Team ID er påkrevd" }),
		name: z.string().min(1, { message: "Navn er påkrevd" }),
		datetime: z.date({ required_error: "Starttid er påkrevd" }),
		endAt: z.date({ required_error: "Sluttid er påkrevd" }),
		type: z.string({
			required_error: "Type er påkrevd",
		}),
		location: z
			.string()
			.optional()
			.transform((val) => (val?.trim() ? val : undefined)),
		note: z
			.string()
			.optional()
			.transform((val) => (val?.trim() ? val : undefined)),
	})
	.refine((data) => data.endAt >= data.datetime, {
		message: "Sluttid må være etter starttid",
	});

export const UpdateEventInputSchema = z
	.object({
		id: z.string().min(1, { message: "Event ID er påkrevd" }),
		teamId: z.string().min(1, { message: "Team ID er påkrevd" }),
		name: z.string().min(1, { message: "Navn er påkrevd" }),
		datetime: z.date({ required_error: "Starttid er påkrevd" }),
		endAt: z.date({ required_error: "Sluttid er påkrevd" }),
		type: z.enum(["TRAINING", "MATCH", "SOCIAL", "OTHER"], {
			required_error: "Type er påkrevd",
		}),
		location: z
			.string()
			.optional()
			.transform((val) => (val?.trim() ? val : undefined)),
		note: z
			.string()
			.optional()
			.transform((val) => (val?.trim() ? val : undefined)),
	})
	.refine((data) => data.endAt >= data.datetime, {
		message: "Sluttid må være etter starttid",
	});

export const DeleteEventInputSchema = z.object({
	id: z.string().min(1, { message: "Event ID er påkrevd" }),
	teamId: z.string().min(1, { message: "Team ID er påkrevd" }),
});
