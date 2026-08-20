import { db } from "~/server/db";

/**
 * Hvem er invitert til et arrangement.
 *
 * `null` betyr hele laget. Det er standarden, og det gjelder alle
 * arrangementer som ble laget før undergruppene fantes — de har ingen
 * rader i team_event_group og skal fortsatt være åpne for alle.
 */
export async function getInvitedUserIds(
	eventId: string,
): Promise<string[] | null> {
	const invitedGroups = await db.teamEventGroup.findMany({
		where: { eventId },
		select: { groupId: true },
	});

	if (invitedGroups.length === 0) return null;

	const members = await db.teamGroupMember.findMany({
		where: { groupId: { in: invitedGroups.map((row) => row.groupId) } },
		select: { userId: true },
	});

	// Er man med i to inviterte grupper, skal man bare telles én gang.
	return [...new Set(members.map((member) => member.userId))];
}

export async function isUserInvited(
	eventId: string,
	userId: string,
): Promise<boolean> {
	const invitedUserIds = await getInvitedUserIds(eventId);

	if (invitedUserIds === null) return true;

	return invitedUserIds.includes(userId);
}

/**
 * Filter til spørringer mot team_member. Uten begrensning slipper alle
 * gjennom, med begrensning bare de inviterte.
 */
export function invitedUserFilter(invitedUserIds: string[] | null) {
	if (invitedUserIds === null) return {};

	return { userId: { in: invitedUserIds } };
}

/** Undergruppene et arrangement er åpent for. Tom liste = hele laget. */
export async function getInvitedGroups(
	eventId: string,
): Promise<{ id: string; name: string }[]> {
	const rows = await db.teamEventGroup.findMany({
		where: { eventId },
		select: { group: { select: { id: true, name: true } } },
		orderBy: { group: { name: "asc" } },
	});

	return rows.map((row) => row.group);
}
