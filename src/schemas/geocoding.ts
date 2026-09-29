import z from "zod";

export const SearchLocationInputSchema = z.object({
	query: z.string().min(3, { message: "Skriv minst 3 tegn" }),
});
