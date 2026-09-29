import z from "zod";

export const IssueFinesInputSchema = z.object({
	eventId: z.string().min(1, { message: "Event ID er påkrevd" }),
});

export const ReverseFineInputSchema = z.object({
	fineId: z.string().min(1, { message: "Fine ID er påkrevd" }),
});
