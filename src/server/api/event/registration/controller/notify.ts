import type { User } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import type z from "zod";
import { env } from "~/env";
import { sendEmail } from "~/lib/email";
import { notifyUnattendedEventRegistrationSchema } from "~/schemas";
import { type Controller, authorizedProcedure } from "~/server/api/trpc";
import { hasTeamAccessMiddleware } from "~/server/api/util/auth";

const handler: Controller<
	z.infer<typeof notifyUnattendedEventRegistrationSchema>,
	void
> = async ({ input, ctx }) => {
	await hasTeamAccessMiddleware(ctx.user as User, input.teamId, ["ADMIN"]);

	const event = await ctx.db.teamEvent.findUnique({
		where: {
			id: input.eventId,
		},
	});

	if (!event) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: "Arrangementet ble ikke funnet.",
		});
	}

	const teamMembers = await ctx.db.teamMember.findMany({
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

	const registrations = await ctx.db.registration.findMany({
		where: {
			eventId: input.eventId,
		},
	});

	const unattendedMembers = teamMembers.filter(
		(member) =>
			!registrations.some(
				(registration) => registration.userId === member.userId,
			),
	);

	const emails = unattendedMembers.map((member) => member.user.email);

	await sendEmail(emails, "Husk å melde deg på arrangement", [
		{ type: "title", content: "Du har ikke meldt deg på" },
		{
			type: "text",
			content: `Du har ikke meldt deg på "${event.name}". Vennligst gå til laget ditt for å melde oppmøtet på arrangementet.`,
		},
		{
			type: "text",
			content: `Dato og tid: ${event.startAt.toLocaleString()}`,
		},
		{ type: "text", content: event.location ? `Sted: ${event.location}` : "" },
		{ type: "text", content: event.note ? `Notat: ${event.note}` : "" },
		{
			type: "button",
			text: "Se arrangementet",
			url: `${env.NEXT_PUBLIC_URL}/lag/${input.teamId}`,
		},
	]);
};

export default authorizedProcedure
	.input(notifyUnattendedEventRegistrationSchema)
	.mutation(handler);
