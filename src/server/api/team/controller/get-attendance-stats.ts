import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { isEventPast } from "~/server/api/util/event";
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

	const [teamMembers, teamEvents] = await Promise.all([
		ctx.db.teamMember.findMany({
			where: { teamId },
			include: {
				user: {
					select: {
						id: true,
						name: true,
						image: true,
					},
				},
			},
		}),
		ctx.db.teamEvent.findMany({
			where: { teamId },
			select: { id: true, startAt: true, endAt: true },
		}),
	]);

	const totalEvents = teamEvents.length;
	const eventIds = teamEvents.map((e) => e.id);
	const eventMap = new Map(teamEvents.map((e) => [e.id, e]));

	const [registrations, absences, manualAttendances] = await Promise.all([
		ctx.db.registration.findMany({
			where: { eventId: { in: eventIds }, type: "ATTENDING" },
			select: { userId: true, eventId: true },
		}),
		ctx.db.attendance
			.findMany({
				where: { eventId: { in: eventIds }, status: "ABSENT" },
				select: { userId: true, eventId: true },
			})
			.then((rows) => new Set(rows.map((a) => `${a.userId}:${a.eventId}`))),
		ctx.db.attendance.findMany({
			where: { eventId: { in: eventIds }, status: "PRESENT", source: "MANUAL" },
			select: { userId: true, eventId: true },
		}),
	]);

	const registrationKeys = new Set(
		registrations.map((r) => `${r.userId}:${r.eventId}`),
	);

	const countsAsAttendance: { userId: string }[] = [
		...registrations.filter((reg) => {
			const event = eventMap.get(reg.eventId);
			if (!event || !isEventPast(event)) return true;
			return !absences.has(`${reg.userId}:${reg.eventId}`);
		}),
		...manualAttendances.filter(
			(a) => !registrationKeys.has(`${a.userId}:${a.eventId}`),
		),
	];

	// Count attendances per user
	const attendanceCounts = countsAsAttendance.reduce(
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
