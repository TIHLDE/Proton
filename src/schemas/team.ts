import z from "zod";

const teamCategorySchema = z.enum(["PYTHONS", "TIHLDE"]);

export const CreateTeamInputSchema = z.object({
	name: z.string().min(1, { message: "Du må angi et navn" }),
	slug: z.string().optional(),
	category: teamCategorySchema.optional(),
	logoUrl: z.union([z.literal(""), z.string().url()]).optional(),
	emoji: z.string().max(8).optional(),
});

export const UpdateTeamInputSchema = z.object({
	id: z.string().min(1, { message: "Team ID er påkrevd" }),
	name: z.string().min(1, { message: "Du må angi et navn" }),
	slug: z.string().optional(),
	category: teamCategorySchema.optional(),
	logoUrl: z.union([z.literal(""), z.string().url()]).optional(),
	emoji: z.string().max(8).optional(),
});

export const DeleteTeamInputSchema = z.object({
	id: z.string().min(1, { message: "Team ID er påkrevd" }),
});
