import z from "zod";

export const SignInInputSchema = z.object({
	username: z.string().min(1, { message: "Du må angi et brukernavn" }),
	password: z.string().min(1, { message: "Du må angi et passord" }),
});
