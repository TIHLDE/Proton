import type { User } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import type z from "zod";
import { AddAssignmentSchema, RemoveAssignmentSchema } from "~/schemas";
import { type Controller, authorizedProcedure } from "../../trpc";
import { hasTeamAccessMiddleware } from "../../util/auth";

const addHandler: Controller<
	z.infer<typeof AddAssignmentSchema>,
	void
> = async ({ input, ctx }) => {
	const period = await ctx.db.leadershipPeriod.findUnique({
		where: { id: input.periodId },
	});

	if (!period) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: "Perioden finnes ikke.",
		});
	}

	await hasTeamAccessMiddleware(ctx.user as User, period.teamId, [
		"ADMIN",
		"SUBADMIN",
	]);

	const position = await ctx.db.teamPosition.findFirst({
		where: { id: input.positionId, teamId: period.teamId },
	});

	if (!position) {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: "Vervet hører ikke til dette laget.",
		});
	}

	// Folk går ut av laget, men skal bli stående i historikken. Derfor
	// sjekkes medlemskap bare når tildelingen opprettes.
	const membership = await ctx.db.teamMember.findUnique({
		where: {
			userId_teamId: { userId: input.userId, teamId: period.teamId },
		},
	});

	if (!membership) {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: "Personen er ikke medlem av laget.",
		});
	}

	const existing = await ctx.db.positionAssignment.findFirst({
		where: {
			periodId: input.periodId,
			positionId: input.positionId,
			userId: input.userId,
		},
	});

	if (existing) {
		throw new TRPCError({
			code: "CONFLICT",
			message: "Personen har allerede dette vervet i perioden.",
		});
	}

	await ctx.db.positionAssignment.create({
		data: {
			periodId: input.periodId,
			positionId: input.positionId,
			userId: input.userId,
		},
	});
};

const removeHandler: Controller<
	z.infer<typeof RemoveAssignmentSchema>,
	void
> = async ({ input, ctx }) => {
	const assignment = await ctx.db.positionAssignment.findUnique({
		where: { id: input.assignmentId },
		select: { period: { select: { teamId: true } } },
	});

	if (!assignment) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: "Tildelingen finnes ikke.",
		});
	}

	await hasTeamAccessMiddleware(ctx.user as User, assignment.period.teamId, [
		"ADMIN",
		"SUBADMIN",
	]);

	await ctx.db.positionAssignment.delete({ where: { id: input.assignmentId } });
};

export const addAssignment = authorizedProcedure
	.input(AddAssignmentSchema)
	.mutation(addHandler);

export const removeAssignment = authorizedProcedure
	.input(RemoveAssignmentSchema)
	.mutation(removeHandler);
