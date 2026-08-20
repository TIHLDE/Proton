import z from "zod";

export const CreateTeamGroupSchema = z.object({
	teamId: z.string().min(1, { message: "Lag ID er påkrevd" }),
	name: z
		.string()
		.min(1, { message: "Du må angi et navn" })
		.max(60, { message: "Navnet kan være maks 60 tegn" }),
	description: z
		.string()
		.max(200, { message: "Beskrivelsen kan være maks 200 tegn" })
		.optional(),
});

export const UpdateTeamGroupSchema = z.object({
	groupId: z.string().min(1, { message: "Undergruppe ID er påkrevd" }),
	name: z
		.string()
		.min(1, { message: "Du må angi et navn" })
		.max(60, { message: "Navnet kan være maks 60 tegn" }),
	description: z
		.string()
		.max(200, { message: "Beskrivelsen kan være maks 200 tegn" })
		.optional(),
});

export const DeleteTeamGroupSchema = z.object({
	groupId: z.string().min(1, { message: "Undergruppe ID er påkrevd" }),
});

export const SetTeamGroupMembersSchema = z.object({
	groupId: z.string().min(1, { message: "Undergruppe ID er påkrevd" }),
	userIds: z.array(z.string().min(1)),
});
