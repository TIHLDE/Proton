import z from "zod";

export const CreateTeamInputSchema = z.object({
	name: z.string().min(1, { message: "Du må angi et navn" }),
	slug: z.string().min(1, { message: "Du må angi en gyldig slug" }).optional(),
});
