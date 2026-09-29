import type { User } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import type z from "zod";
import { IssueFinesInputSchema } from "~/schemas";
import { db } from "~/server/db";
import { type Controller, authorizedProcedure } from "../../trpc";
import { hasTeamAccessMiddleware } from "../../util/auth";
import { getNonRespondedUserIds } from "../../util/invitees";

const handler: Controller<
	z.infer<typeof IssueFinesInputSchema>,
	{ issuedCount: number }
> = async ({ input, ctx }) => {
	const event = await db.teamEvent.findUnique({
		where: { id: input.eventId },
	});

	if (!event) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: "Arrangementet finnes ikke.",
		});
	}

	await hasTeamAccessMiddleware(ctx.user as User, event.teamId, [
		"ADMIN",
		"SUBADMIN",
	]);

	// Serversjekk, ikke bare en UI-detalj: knappen skjules for feil
	// arrangementstype/for tidlig klientside, men endepunktet må stå på
	// egne ben mot noen som kaller det direkte.
	if (event.eventType !== "TRAINING" && event.eventType !== "MATCH") {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: "Bøter kan bare gis for trening og kamp.",
		});
	}

	const deadline = event.registrationDeadline ?? event.startAt;
	if (new Date(deadline) > new Date()) {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: "Påmeldingsfristen har ikke gått ut ennå.",
		});
	}

	const nonResponders = await getNonRespondedUserIds(event.id);

	if (nonResponders.length === 0) {
		return { issuedCount: 0 };
	}

	const amount = event.eventType === "MATCH" ? 2 : 1;

	// skipDuplicates lener seg på @@unique([userId, eventId]) i databasen i
	// stedet for å lese "hvem har allerede bot" og filtrere i appen - to
	// raske klikk ville ellers kunnet beregne samme sett og kollidere.
	const result = await db.fine.createMany({
		data: nonResponders.map((userId) => ({
			userId,
			teamId: event.teamId,
			eventId: event.id,
			amount,
			issuedByUserId: ctx.user.id,
		})),
		skipDuplicates: true,
	});

	return { issuedCount: result.count };
};

export default authorizedProcedure
	.input(IssueFinesInputSchema)
	.mutation(handler);
