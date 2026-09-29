import z from "zod";

export const UpdateTeamMembershipRoleSchema = z.object({
	membershipId: z.string().min(1, { message: "Medlemskap ID er påkrevd" }),
	teamId: z.string().min(1, { message: "Team ID er påkrevd" }),
	role: z.string().min(1, { message: "Ugyldig rolle" }),
});

export const SetTeamMemberInactiveSchema = z
	.object({
		membershipId: z.string().min(1, { message: "Medlemskap ID er påkrevd" }),
		inactive: z.boolean(),
		reason: z
			.string()
			.trim()
			.max(300, { message: "Begrunnelsen kan være maks 300 tegn" })
			.optional(),
	})
	.superRefine((data, ctx) => {
		if (data.inactive && !data.reason) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Du må begrunne hvorfor spilleren er inaktiv",
				path: ["reason"],
			});
		}
	});
