import z from "zod";

export const UpdateUserRoleInputSchema = z.object({
	userId: z.string(),
	isAdmin: z.boolean(),
});
