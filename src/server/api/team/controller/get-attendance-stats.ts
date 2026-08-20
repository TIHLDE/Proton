import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { findSeason, getSeasons } from "~/lib/season";
import { isEventPast } from "~/server/api/util/event";
import { type Controller, authorizedProcedure } from "../../trpc";

const inputSchema = z.object({
	teamId: z.string(),
	seasonId: z.string().optional(),
	groupId: z.string().optional(),
	eventType: z.enum(["TRAINING", "MATCH", "SOCIAL", "OTHER"]).optional(),
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

	const season = input.seasonId
		? findSeason(getSeasons(new Date(2000, 0, 1)), input.seasonId)
		: undefined;

	const [teamMembers, teamEvents, groupMemberships] = await Promise.all([
		ctx.db.teamMember.findMany({
			where: {
				teamId,
				...(input.groupId
					? { user: { groupMemberships: { some: { groupId: input.groupId } } } }
					: {}),
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
		}),
		ctx.db.teamEvent.findMany({
			where: {
				teamId,
				...(input.eventType ? { eventType: input.eventType } : {}),
				...(season ? { startAt: { gte: season.from, lt: season.to } } : {}),
				...(input.groupId
					? {
							// Med et gruppefilter er spørsmålet «hvordan møter denne
							// gruppa opp», altså på arrangementene den var invitert
							// til — pluss de åpne, som gjelder alle.
							OR: [
								{ invitedGroups: { none: {} } },
								{ invitedGroups: { some: { groupId: input.groupId } } },
							],
						}
					: {}),
			},
			select: {
				id: true,
				startAt: true,
				endAt: true,
				invitedGroups: { select: { groupId: true } },
			},
		}),
		ctx.db.teamGroupMember.findMany({
			where: { group: { teamId } },
			select: { groupId: true, userId: true, createdAt: true },
		}),
	]);

	const eventIds = teamEvents.map((e) => e.id);
	const eventMap = new Map(teamEvents.map((e) => [e.id, e]));

	// Når var hver enkelt med i hver enkelt gruppe. Brukes til å la være å
	// telle arrangementer fra før man ble med — ellers ser en som kom til i
	// oktober ut til å ha sluntret unna alle kampene i september.
	const joinedAt = new Map<string, Date>();
	for (const row of groupMemberships) {
		joinedAt.set(`${row.userId}:${row.groupId}`, row.createdAt);
	}

	const countsTowards = (userId: string, eventId: string): boolean => {
		const event = eventMap.get(eventId);
		if (!event) return false;
		if (event.invitedGroups.length === 0) return true;

		return event.invitedGroups.some((invited) => {
			const joined = joinedAt.get(`${userId}:${invited.groupId}`);
			return joined !== undefined && joined <= event.startAt;
		});
	};

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

		// Nevneren er personlig: bare arrangementer denne spilleren faktisk
		// var invitert til, og bare fra hen ble med i gruppa.
		const totalEvents = eventIds.filter((eventId) =>
			countsTowards(member.userId, eventId),
		).length;

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
