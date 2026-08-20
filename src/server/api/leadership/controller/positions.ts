import type { User } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import type z from "zod";
import {
	CreatePositionSchema,
	DeletePositionSchema,
	UpdatePositionSchema,
} from "~/schemas";
import { type Controller, authorizedProcedure } from "../../trpc";
import { hasTeamAccessMiddleware } from "../../util/auth";

const createHandler: Controller<
	z.infer<typeof CreatePositionSchema>,
	void
> = async ({ input, ctx }) => {
	await hasTeamAccessMiddleware(ctx.user as User, input.teamId, [
		"ADMIN",
		"SUBADMIN",
	]);

	const existing = await ctx.db.teamPosition.findFirst({
		where: { teamId: input.teamId, name: input.name },
	});

	if (existing) {
		throw new TRPCError({
			code: "CONFLICT",
			message: "Laget har allerede et verv med dette navnet.",
		});
	}

	await ctx.db.teamPosition.create({
		data: {
			teamId: input.teamId,
			name: input.name,
			order: input.order ?? 0,
		},
	});
};

const updateHandler: Controller<
	z.infer<typeof UpdatePositionSchema>,
	void
> = async ({ input, ctx }) => {
	const position = await ctx.db.teamPosition.findUnique({
		where: { id: input.positionId },
	});

	if (!position) {
		throw new TRPCError({ code: "NOT_FOUND", message: "Vervet finnes ikke." });
	}

	await hasTeamAccessMiddleware(ctx.user as User, position.teamId, [
		"ADMIN",
		"SUBADMIN",
	]);

	const duplicate = await ctx.db.teamPosition.findFirst({
		where: {
			teamId: position.teamId,
			name: input.name,
			id: { not: position.id },
		},
	});

	if (duplicate) {
		throw new TRPCError({
			code: "CONFLICT",
			message: "Laget har allerede et verv med dette navnet.",
		});
	}

	await ctx.db.teamPosition.update({
		where: { id: position.id },
		data: { name: input.name, order: input.order ?? position.order },
	});
};

const deleteHandler: Controller<
	z.infer<typeof DeletePositionSchema>,
	void
> = async ({ input, ctx }) => {
	const position = await ctx.db.teamPosition.findUnique({
		where: { id: input.positionId },
	});

	if (!position) {
		throw new TRPCError({ code: "NOT_FOUND", message: "Vervet finnes ikke." });
	}

	await hasTeamAccessMiddleware(ctx.user as User, position.teamId, [
		"ADMIN",
		"SUBADMIN",
	]);

	// Vervet er brukt i historikken, og å slette det ville tatt med seg hvem
	// som har hatt det. Da er det bedre å si ifra.
	const usedBy = await ctx.db.positionAssignment.count({
		where: { positionId: position.id },
	});

	if (usedBy > 0) {
		throw new TRPCError({
			code: "CONFLICT",
			message:
				"Vervet er i bruk i vervhistorikken. Fjern tildelingene først om det skal slettes.",
		});
	}

	await ctx.db.teamPosition.delete({ where: { id: position.id } });
};

export const createPosition = authorizedProcedure
	.input(CreatePositionSchema)
	.mutation(createHandler);

export const updatePosition = authorizedProcedure
	.input(UpdatePositionSchema)
	.mutation(updateHandler);

export const deletePosition = authorizedProcedure
	.input(DeletePositionSchema)
	.mutation(deleteHandler);
