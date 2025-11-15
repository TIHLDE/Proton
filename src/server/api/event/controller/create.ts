import type { TeamEventType, User } from "@prisma/client";
import type z from "zod";
import { env } from "~/env";
import { sendEmail } from "~/lib/email";
import { CreateEventInputSchema } from "~/schemas";
import { db } from "~/server/db";
import { type Controller, authorizedProcedure } from "../../trpc";
import { hasTeamAccessMiddleware } from "../../util/auth";

const handler: Controller<
	z.infer<typeof CreateEventInputSchema>,
	void
> = async ({ input, ctx }) => {
	// Check if user has access
	await hasTeamAccessMiddleware(ctx.user as User, input.teamId, [
		"ADMIN",
		"SUBADMIN",
	]);

	await db.teamEvent.create({
		data: {
			teamId: input.teamId,
			name: input.name,
			eventType: input.type as TeamEventType,
			startAt: input.datetime,
			endAt: input.endAt,
			location: input.location,
			note: input.note,
		},
	});

	const userEmails = await db.teamMember.findMany({
		where: {
			teamId: input.teamId,
		},
		select: {
			user: {
				select: {
					email: true,
				},
			},
		},
	});

	const emails = userEmails.map((member) => member.user.email);

	await sendEmail(emails, "Nytt arrangement opprettet", [
		{ type: "title", content: "Nytt arrangement opprettet" },
		{
			type: "text",
			content: `Et nytt arrangement "${input.name}" har blitt opprettet for ditt lag.`,
		},
		{
			type: "text",
			content: `Dato og tid: ${input.datetime.toLocaleString()}`,
		},
		{
			type: "text",
			content: input.location
				? `Sted: ${input.location}`
				: "Sted: ikke oppgitt",
		},
		{
			type: "text",
			content: input.note ? `Notat: ${input.note}` : "Ingen beskrivelse",
		},
		{
			type: "button",
			text: "Se arrangementet",
			url: `${env.NEXT_PUBLIC_URL}/lag/${input.teamId}`,
		},
	]);
};

export default authorizedProcedure
	.input(CreateEventInputSchema)
	.mutation(handler);
