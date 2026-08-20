import type { User } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import type z from "zod";
import { AddMatchEventSchema } from "~/schemas";
import { db } from "~/server/db";
import { type Controller, authorizedProcedure } from "../../trpc";
import { hasTeamAccessMiddleware } from "../../util/auth";

const handler: Controller<z.infer<typeof AddMatchEventSchema>, void> = async ({
	input,
	ctx,
}) => {
	const event = await db.teamEvent.findUnique({
		where: { id: input.eventId },
		select: { teamId: true, eventType: true },
	});

	if (!event) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: "Arrangement ikke funnet",
		});
	}

	if (event.eventType !== "MATCH") {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: "Bare kamper kan ha hendelser.",
		});
	}

	await hasTeamAccessMiddleware(ctx.user as User, event.teamId, [
		"ADMIN",
		"SUBADMIN",
	]);

	// Medlemskap i laget holder. Kravet er bevisst løsere enn påmeldingen:
	// blir noen med på kampen i siste liten uten å stå i undergruppa, skal
	// målet deres likevel kunne føres.
	const membership = await db.teamMember.findUnique({
		where: {
			userId_teamId: { userId: input.userId, teamId: event.teamId },
		},
	});

	if (!membership) {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: "Spilleren er ikke medlem av laget.",
		});
	}

	// Kampen kan mangle et lagret resultat når første hendelse føres.
	const match = await db.match.upsert({
		where: { eventId: input.eventId },
		create: { eventId: input.eventId },
		update: {},
	});

	await db.matchEvent.create({
		data: {
			matchId: match.id,
			userId: input.userId,
			type: input.type,
		},
	});
};

export default authorizedProcedure.input(AddMatchEventSchema).mutation(handler);
