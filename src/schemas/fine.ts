import z from "zod";

export const GiveNoResponseFinesSchema = z.object({
	eventId: z.string().min(1, { message: "Arrangement ID er påkrevd" }),
	// Negativt er en motpost som trekker ned tellingen på tihlde.org, og 0 er
	// en advarsel som vises der uten å telle.
	quantity: z.coerce
		.number({ invalid_type_error: "Antallet må være et tall" })
		.int({ message: "Antallet må være et helt tall" })
		.min(-20, { message: "Antallet kan være minst -20" })
		.max(20, { message: "Antallet kan være maks 20" }),
	reason: z
		.string()
		.trim()
		.min(1, { message: "Du må angi en grunn" })
		.max(200, { message: "Grunnen kan være maks 200 tegn" }),
	lawId: z.string().uuid().optional(),
});

export const GetFineLawsSchema = z.object({
	teamId: z.string().min(1, { message: "Lag ID er påkrevd" }),
});
