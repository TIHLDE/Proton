import z from "zod";

export const CreateTeamInputSchema = z.object({
	name: z.string().min(1, { message: "Du må angi et navn" }),
	slug: z.string().optional(),
});

export const UpdateTeamInputSchema = z.object({
	id: z.string().min(1, { message: "Team ID er påkrevd" }),
	name: z.string().min(1, { message: "Du må angi et navn" }),
	slug: z.string().optional(),
});

export const DeleteTeamInputSchema = z.object({
	id: z.string().min(1, { message: "Team ID er påkrevd" }),
});
