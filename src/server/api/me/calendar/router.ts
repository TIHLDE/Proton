import { TRPCError } from "@trpc/server";
import { authorizedProcedure, createTRPCRouter } from "~/server/api/trpc";

export const calendarRouter = createTRPCRouter({
	getOrCreateToken: authorizedProcedure.query(async ({ ctx }) => {
		const user = await ctx.db.user.findUniqueOrThrow({
			where: { id: ctx.user.id },
			select: { calendarToken: true },
		});

		if (user.calendarToken) {
			return { token: user.calendarToken };
		}

		const updated = await ctx.db.user.update({
			where: { id: ctx.user.id },
			data: { calendarToken: crypto.randomUUID() },
			select: { calendarToken: true },
		});

		if (!updated.calendarToken) {
			throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
		}

		return { token: updated.calendarToken };
	}),

	regenerateToken: authorizedProcedure.mutation(async ({ ctx }) => {
		const updated = await ctx.db.user.update({
			where: { id: ctx.user.id },
			data: { calendarToken: crypto.randomUUID() },
			select: { calendarToken: true },
		});

		if (!updated.calendarToken) {
			throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
		}

		return { token: updated.calendarToken };
	}),
});
