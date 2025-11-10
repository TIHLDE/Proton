import z from "zod";

export const UpdateTeamMembershipRoleSchema = z.object({
	membershipId: z.string().min(1, { message: "Medlemskap ID er påkrevd" }),
	teamId: z.string().min(1, { message: "Team ID er påkrevd" }),
	role: z.string().min(1, { message: "Ugyldig rolle" }),
});
