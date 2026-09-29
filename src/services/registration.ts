"use server";

import { db } from "~/server/db";

export interface RegistrationCounts {
	attending: number;
	notAttending: number;
	notResponded: number;
}

/**
 * Oppmøtetall for en liste arrangementer i ett par spørringer, uansett hvor
 * mange arrangementer det gjelder - agendaen på forsiden viser typisk flere
 * arrangementer samtidig, og skal ikke gjøre ett kall per kort.
 */
export async function getRegistrationCountsForEvents(
	events: { id: string; teamId: string }[],
): Promise<Map<string, RegistrationCounts>> {
	if (events.length === 0) return new Map();

	const eventIds = events.map((event) => event.id);
	const teamIds = [...new Set(events.map((event) => event.teamId))];

	const [registrationGroups, invitedGroupRows, teamMemberGroups] =
		await Promise.all([
			db.registration.groupBy({
				by: ["eventId", "type"],
				where: { eventId: { in: eventIds } },
				_count: { type: true },
			}),
			db.teamEventGroup.findMany({
				where: { eventId: { in: eventIds } },
				select: { eventId: true, groupId: true },
			}),
			db.teamMember.groupBy({
				by: ["teamId"],
				where: { teamId: { in: teamIds } },
				_count: { userId: true },
			}),
		]);

	// Bare arrangementer åpne for utvalgte undergrupper trenger medlemmene i
	// akkurat de gruppene - hentes samlet for alle slike arrangementer.
	const involvedGroupIds = [
		...new Set(invitedGroupRows.map((row) => row.groupId)),
	];
	const groupMembers = involvedGroupIds.length
		? await db.teamGroupMember.findMany({
				where: { groupId: { in: involvedGroupIds } },
				select: { groupId: true, userId: true },
			})
		: [];

	const memberIdsByGroup = new Map<string, Set<string>>();
	for (const member of groupMembers) {
		if (!memberIdsByGroup.has(member.groupId)) {
			memberIdsByGroup.set(member.groupId, new Set());
		}
		memberIdsByGroup.get(member.groupId)?.add(member.userId);
	}

	const invitedGroupIdsByEvent = new Map<string, string[]>();
	for (const row of invitedGroupRows) {
		if (!invitedGroupIdsByEvent.has(row.eventId)) {
			invitedGroupIdsByEvent.set(row.eventId, []);
		}
		invitedGroupIdsByEvent.get(row.eventId)?.push(row.groupId);
	}

	const memberCountByTeam = new Map(
		teamMemberGroups.map((row) => [row.teamId, row._count.userId]),
	);

	const responsesByEvent = new Map<
		string,
		{ attending: number; notAttending: number }
	>();
	for (const row of registrationGroups) {
		const entry = responsesByEvent.get(row.eventId) ?? {
			attending: 0,
			notAttending: 0,
		};
		if (row.type === "ATTENDING") entry.attending = row._count.type;
		if (row.type === "NOT_ATTENDING") entry.notAttending = row._count.type;
		responsesByEvent.set(row.eventId, entry);
	}

	const counts = new Map<string, RegistrationCounts>();
	for (const event of events) {
		const { attending, notAttending } = responsesByEvent.get(event.id) ?? {
			attending: 0,
			notAttending: 0,
		};

		const invitedGroupIds = invitedGroupIdsByEvent.get(event.id);
		// Ingen rader i team_event_group betyr hele laget, jf. getInvitedUserIds.
		const eligible = invitedGroupIds
			? new Set(
					invitedGroupIds.flatMap((groupId) => [
						...(memberIdsByGroup.get(groupId) ?? []),
					]),
				).size
			: (memberCountByTeam.get(event.teamId) ?? 0);

		counts.set(event.id, {
			attending,
			notAttending,
			notResponded: Math.max(eligible - attending - notAttending, 0),
		});
	}

	return counts;
}
