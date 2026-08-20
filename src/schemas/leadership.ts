import z from "zod";

export const CreatePositionSchema = z.object({
	teamId: z.string().min(1, { message: "Lag ID er påkrevd" }),
	name: z
		.string()
		.min(1, { message: "Du må angi et navn" })
		.max(60, { message: "Navnet kan være maks 60 tegn" }),
	order: z.coerce.number().int().min(0).max(999).optional(),
});

export const UpdatePositionSchema = z.object({
	positionId: z.string().min(1, { message: "Verv ID er påkrevd" }),
	name: z
		.string()
		.min(1, { message: "Du må angi et navn" })
		.max(60, { message: "Navnet kan være maks 60 tegn" }),
	order: z.coerce.number().int().min(0).max(999).optional(),
});

export const DeletePositionSchema = z.object({
	positionId: z.string().min(1, { message: "Verv ID er påkrevd" }),
});

export const CreatePeriodSchema = z
	.object({
		teamId: z.string().min(1, { message: "Lag ID er påkrevd" }),
		name: z.string().max(60).optional(),
		startDate: z.date({ required_error: "Startdato er påkrevd" }),
		endDate: z.date({ required_error: "Sluttdato er påkrevd" }),
	})
	.superRefine((data, ctx) => {
		if (data.endDate <= data.startDate) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Sluttdato må være etter startdato",
				path: ["endDate"],
			});
		}
	});

export const UpdatePeriodSchema = z
	.object({
		periodId: z.string().min(1, { message: "Periode ID er påkrevd" }),
		name: z.string().max(60).optional(),
		startDate: z.date({ required_error: "Startdato er påkrevd" }),
		endDate: z.date({ required_error: "Sluttdato er påkrevd" }),
	})
	.superRefine((data, ctx) => {
		if (data.endDate <= data.startDate) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Sluttdato må være etter startdato",
				path: ["endDate"],
			});
		}
	});

export const DeletePeriodSchema = z.object({
	periodId: z.string().min(1, { message: "Periode ID er påkrevd" }),
});

export const AddAssignmentSchema = z.object({
	periodId: z.string().min(1, { message: "Periode ID er påkrevd" }),
	positionId: z.string().min(1, { message: "Du må velge et verv" }),
	userId: z.string().min(1, { message: "Du må velge en person" }),
});

export const RemoveAssignmentSchema = z.object({
	assignmentId: z.string().min(1, { message: "Tildeling ID er påkrevd" }),
});
