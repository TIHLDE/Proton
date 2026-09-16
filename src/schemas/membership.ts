import z from "zod";

export const UpdateTeamMembershipRoleSchema = z.object({
	membershipId: z.string().min(1, { message: "Medlemskap ID er påkrevd" }),
	teamId: z.string().min(1, { message: "Team ID er påkrevd" }),
	role: z.string().min(1, { message: "Ugyldig rolle" }),
});

export const UpdateTeamMembershipStatusSchema = z
	.object({
		membershipId: z.string().min(1, { message: "Medlemskap ID er påkrevd" }),
		teamId: z.string().min(1, { message: "Team ID er påkrevd" }),
		isActive: z.boolean(),
		comment: z
			.string()
			.max(500, { message: "Kommentaren kan være maks 500 tegn" })
			.optional(),
	})
	.refine((data) => data.isActive || !!data.comment?.trim(), {
		message: "Skriv en kommentar til hvorfor spilleren settes som inaktiv",
		path: ["comment"],
	});
