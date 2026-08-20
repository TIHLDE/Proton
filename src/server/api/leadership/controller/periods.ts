import type { User } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import type z from "zod";
import {
	CreatePeriodSchema,
	DeletePeriodSchema,
	UpdatePeriodSchema,
} from "~/schemas";
import { type Controller, authorizedProcedure } from "../../trpc";
import { hasTeamAccessMiddleware } from "../../util/auth";

const createHandler: Controller<
	z.infer<typeof CreatePeriodSchema>,
	void
> = async ({ input, ctx }) => {
	await hasTeamAccessMiddleware(ctx.user as User, input.teamId, [
		"ADMIN",
		"SUBADMIN",
	]);

	await ctx.db.leadershipPeriod.create({
		data: {
			teamId: input.teamId,
			name: input.name || null,
			startDate: input.startDate,
			endDate: input.endDate,
		},
	});
};

const updateHandler: Controller<
	z.infer<typeof UpdatePeriodSchema>,
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

	await ctx.db.leadershipPeriod.update({
		where: { id: period.id },
		data: {
			name: input.name || null,
			startDate: input.startDate,
			endDate: input.endDate,
		},
	});
};

const deleteHandler: Controller<
	z.infer<typeof DeletePeriodSchema>,
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

	await ctx.db.leadershipPeriod.delete({ where: { id: period.id } });
};

export const createPeriod = authorizedProcedure
	.input(CreatePeriodSchema)
	.mutation(createHandler);

export const updatePeriod = authorizedProcedure
	.input(UpdatePeriodSchema)
	.mutation(updateHandler);

export const deletePeriod = authorizedProcedure
	.input(DeletePeriodSchema)
	.mutation(deleteHandler);
