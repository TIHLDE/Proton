import { Prisma, type User } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import type z from "zod";
import { createGroupFine } from "~/actions";
import { env } from "~/env";
import { photonFailureMessage } from "~/lib/photon";
import { GiveNoResponseFinesSchema } from "~/schemas";
import { type Controller, authorizedProcedure } from "~/server/api/trpc";
import { hasTeamAccessMiddleware } from "~/server/api/util/auth";
import {
	getInvitedUserIds,
	invitedUserFilter,
} from "~/server/api/util/invitees";

/**
 * Tokenet er ekte også lokalt, så en test mot localhost ville gitt ekte bøter
 * i ekte grupper. Uten eksplisitt verdi sendes det derfor bare i produksjon.
 */
const sendToTihlde =
	env.PHOTON_FINES_ENABLED !== undefined
		? env.PHOTON_FINES_ENABLED === "true"
		: env.NODE_ENV === "production";

type Outcome = { name: string; message: string };

const handler: Controller<
	z.infer<typeof GiveNoResponseFinesSchema>,
	{
		given: string[];
		skipped: Outcome[];
		failed: Outcome[];
		sentToTihlde: boolean;
	}
> = async ({ input, ctx }) => {
	const event = await ctx.db.teamEvent.findUnique({
		where: { id: input.eventId },
		select: {
			id: true,
			teamId: true,
			startAt: true,
			registrationDeadline: true,
			team: { select: { slug: true } },
		},
	});

	if (!event) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: "Arrangementet ble ikke funnet.",
		});
	}

	await hasTeamAccessMiddleware(ctx.user as User, event.teamId, [
		"ADMIN",
		"SUBADMIN",
	]);

	const groupSlug = event.team.slug;
	if (!groupSlug) {
		throw new TRPCError({
			code: "PRECONDITION_FAILED",
			message: "Laget er ikke koblet til en gruppe på tihlde.org.",
		});
	}

	// Før fristen har ingen gjort noe galt ennå. Uten egen frist er det
	// arrangementets start som gjelder.
	if ((event.registrationDeadline ?? event.startAt) > new Date()) {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: "Påmeldingsfristen har ikke gått ut ennå.",
		});
	}

	// Samme utvalg som påminnelsen: bare de inviterte kunne svare.
	const invitedUserIds = await getInvitedUserIds(event.id);

	const [members, registrations] = await Promise.all([
		ctx.db.teamMember.findMany({
			where: { teamId: event.teamId, ...invitedUserFilter(invitedUserIds) },
			select: {
				inactiveSince: true,
				user: {
					select: {
						id: true,
						name: true,
						// accountId er brukerens id på tihlde.org, og det er den
						// Photon kjenner mottakeren igjen på.
						accounts: {
							where: { providerId: "photon" },
							select: { accountId: true },
						},
					},
				},
			},
		}),
		ctx.db.registration.findMany({
			where: { eventId: event.id },
			select: { userId: true },
		}),
	]);

	const answered = new Set(registrations.map(({ userId }) => userId));
	const unanswered = members
		.filter(({ user }) => !answered.has(user.id))
		.map(({ user, inactiveSince }) => ({
			...user,
			inactive: inactiveSince !== null,
		}));

	const given: string[] = [];
	const skipped: Outcome[] = [];
	const failed: Outcome[] = [];
	let reauthRequired = false;

	// Ett og ett, ikke parallelt: tokenet kan fornyes underveis, og Photon
	// regner andre gangs bruk av samme refresh-token som tyveri.
	for (const user of unanswered) {
		if (user.inactive) {
			skipped.push({ name: user.name, message: "inaktiv" });
			continue;
		}

		const tihldeUserId = user.accounts[0]?.accountId;
		if (!tihldeUserId) {
			skipped.push({ name: user.name, message: "ikke koblet til TIHLDE" });
			continue;
		}
		if (reauthRequired) {
			failed.push({ name: user.name, message: "logg inn med TIHLDE på nytt" });
			continue;
		}

		// Den unike nøkkelen (eventId, userId) er låsen: et dobbeltklikk eller
		// to admins samtidig kan ikke gi samme person bot to ganger.
		const record = await ctx.db.eventFine
			.create({
				data: {
					eventId: event.id,
					userId: user.id,
					issuedById: ctx.user.id,
					quantity: input.quantity,
					reason: input.reason,
					lawId: input.lawId,
				},
			})
			.catch((error: unknown) => {
				if (
					error instanceof Prisma.PrismaClientKnownRequestError &&
					error.code === "P2002"
				) {
					return null;
				}
				throw error;
			});

		if (!record) {
			skipped.push({ name: user.name, message: "har allerede fått bot" });
			continue;
		}

		if (!sendToTihlde) {
			given.push(user.name);
			continue;
		}

		const result = await createGroupFine(groupSlug, {
			userId: tihldeUserId,
			amount: input.quantity,
			reason: input.reason,
			...(input.lawId ? { lawId: input.lawId } : {}),
		});

		if (!result.ok) {
			// Uten boten på tihlde.org skal ikke låsen stå igjen, ellers kan
			// personen aldri få den.
			await ctx.db.eventFine.delete({ where: { id: record.id } });
			if (result.reason === "reauth") reauthRequired = true;
			failed.push({ name: user.name, message: photonFailureMessage(result) });
			continue;
		}

		await ctx.db.eventFine.update({
			where: { id: record.id },
			data: { photonFineId: result.data.id },
		});
		given.push(user.name);
	}

	return { given, skipped, failed, sentToTihlde: sendToTihlde };
};

export default authorizedProcedure
	.input(GiveNoResponseFinesSchema)
	.mutation(handler);
