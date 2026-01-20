import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { type Controller, authorizedProcedure } from "../../trpc";

const inputSchema = z.object({
	teamId: z.string(),
});

type AttendanceStats = {
	userId: string;
	userName: string;
	userImage: string | null;
	attendedCount: number;
	totalEvents: number;
	attendanceRate: number;
};

const handler: Controller<
	z.infer<typeof inputSchema>,
	AttendanceStats[]
> = async ({ input, ctx }) => {
	const { teamId } = input;

	// Check if user has access to the team
	const membership = await ctx.db.teamMember.findFirst({
		where: {
			teamId,
			userId: ctx.user.id,
		},
	});

	if (!membership && !ctx.user.isAdmin) {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "Du har ikke tilgang til dette laget.",
		});
	}

	// Get all team members
	const teamMembers = await ctx.db.teamMember.findMany({
		where: {
			teamId,
		},
		include: {
			user: {
				select: {
					id: true,
					name: true,
					image: true,
				},
			},
		},
	});

	// Get all events for the team
	const teamEvents = await ctx.db.teamEvent.findMany({
		where: {
			teamId,
		},
		select: {
			id: true,
		},
	});

	const totalEvents = teamEvents.length;
	const eventIds = teamEvents.map((e) => e.id);

	// Get all registrations for team events
	const registrations = await ctx.db.registration.findMany({
		where: {
			eventId: {
				in: eventIds,
			},
			type: "ATTENDING",
		},
		select: {
			userId: true,
		},
	});

	// Count attendances per user
	const attendanceCounts = registrations.reduce(
		(acc, reg) => {
			acc[reg.userId] = (acc[reg.userId] || 0) + 1;
			return acc;
		},
		{} as Record<string, number>,
	);

	// Build stats for each team member
	const stats: AttendanceStats[] = teamMembers.map((member) => {
		const attendedCount = attendanceCounts[member.userId] || 0;
		const attendanceRate =
			totalEvents > 0 ? (attendedCount / totalEvents) * 100 : 0;

		return {
			userId: member.user.id,
			userName: member.user.name,
			userImage: member.user.image,
			attendedCount,
			totalEvents,
			attendanceRate,
		};
	});

	// Sort by attended count (descending)
	stats.sort((a, b) => b.attendedCount - a.attendedCount);

	return stats;
};

export default authorizedProcedure.input(inputSchema).query(handler);
