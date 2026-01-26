import z from "zod";

export const CreateEventInputSchema = z
	.object({
		teamId: z.string().min(1, { message: "Team ID er påkrevd" }),
		name: z.string().min(1, { message: "Navn er påkrevd" }),
		startDatetime: z.date({ required_error: "Start dato og tid er påkrevd" }),
		endDatetime: z.date({ required_error: "Slutt dato og tid er påkrevd" }),
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
		registrationDeadline: z.date().optional(),
	})
	.superRefine((data, ctx) => {
		if (data.endDatetime < data.startDatetime) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Slutt dato og tid må være etter start dato og tid",
				path: ["endDatetime"],
			});
		}
	});

export const UpdateEventInputSchema = z
	.object({
		id: z.string().min(1, { message: "Event ID er påkrevd" }),
		teamId: z.string().min(1, { message: "Team ID er påkrevd" }),
		name: z.string().min(1, { message: "Navn er påkrevd" }),
		startDatetime: z.date({ required_error: "Start dato og tid er påkrevd" }),
		endDatetime: z.date({ required_error: "Slutt dato og tid er påkrevd" }),
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
		registrationDeadline: z.date().optional(),
	})
	.superRefine((data, ctx) => {
		if (data.endDatetime < data.startDatetime) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Slutt dato og tid må være etter start dato og tid",
				path: ["endDatetime"],
			});
		}
	});

export const DeleteEventInputSchema = z.object({
	id: z.string().min(1, { message: "Event ID er påkrevd" }),
	teamId: z.string().min(1, { message: "Team ID er påkrevd" }),
});
