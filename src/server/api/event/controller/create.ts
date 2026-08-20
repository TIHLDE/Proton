import type { TeamEventType, User } from "@prisma/client";
import type z from "zod";
import { env } from "~/env";
import { sendNotification } from "~/lib/notify";
import { CreateEventInputSchema } from "~/schemas";
import { db } from "~/server/db";
import { type Controller, authorizedProcedure } from "../../trpc";
import { hasTeamAccessMiddleware } from "../../util/auth";
import { getInvitedUserIds, invitedUserFilter } from "../../util/invitees";
import { validateGroupIds } from "../../util/validate-groups";

const handler: Controller<
	z.infer<typeof CreateEventInputSchema>,
	void
> = async ({ input, ctx }) => {
	// Check if user has access
	await hasTeamAccessMiddleware(ctx.user as User, input.teamId, [
		"ADMIN",
		"SUBADMIN",
	]);

	const validGroupIds = await validateGroupIds(
		input.teamId,
		input.groupIds ?? [],
	);

	const event = await db.teamEvent.create({
		data: {
			teamId: input.teamId,
			name: input.name,
			eventType: input.type as TeamEventType,
			startAt: input.startDatetime,
			endAt: input.endDatetime,
			location: input.location,
			note: input.note,
			registrationDeadline: input.registrationDeadline,
			invitedGroups: {
				create: validGroupIds.map((groupId) => ({ groupId })),
			},
		},
	});

	// Varselet skal bare gå til de som faktisk kan melde seg på.
	const invitedUserIds = await getInvitedUserIds(event.id);

	const teamMembers = await db.teamMember.findMany({
		where: {
			teamId: input.teamId,
			...invitedUserFilter(invitedUserIds),
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

	void sendNotification({
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
				content: `Dato og tid: ${input.startDatetime.toLocaleString()} - ${input.endDatetime.toLocaleString()}`,
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
			body: `"${input.name}" - ${input.startDatetime.toLocaleString()}`,
			url: `${env.NEXT_PUBLIC_URL}/lag/${input.teamId}`,
		},
	});
};

export default authorizedProcedure
	.input(CreateEventInputSchema)
	.mutation(handler);
