import type { TeamEventType, User } from "@prisma/client";
import type z from "zod";
import { env } from "~/env";
import { sendNotification } from "~/lib/notify";
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
			endAt: input.datetime,
			location: input.location,
			note: input.note,
			registrationDeadline: input.registrationDeadline,
		},
	});

	const teamMembers = await db.teamMember.findMany({
		where: {
			teamId: input.teamId,
		},
		select: {
			userId: true,
			user: {
				select: {
					email: true,
				},
			},
		},
	});

	const userIds = teamMembers.map((member) => member.userId);
	const emails = teamMembers.map((member) => member.user.email);

	await sendNotification({
		userIds,
		emails,
		subject: "Nytt arrangement opprettet",
		emailContent: [
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
		],
		pushPayload: {
			title: "Nytt arrangement opprettet",
			body: `"${input.name}" - ${input.datetime.toLocaleString()}`,
			url: `${env.NEXT_PUBLIC_URL}/lag/${input.teamId}`,
		},
	});
};

export default authorizedProcedure
	.input(CreateEventInputSchema)
	.mutation(handler);
