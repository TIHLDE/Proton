"use server";

import { db } from "~/server/db";

export async function getFinesByTeam(teamId: string) {
	return db.fine.findMany({
		where: { teamId },
		include: {
			user: { select: { id: true, name: true, image: true } },
			event: { select: { id: true, name: true, eventType: true } },
			issuedBy: { select: { id: true, name: true } },
			reversedBy: { select: { id: true, name: true } },
		},
		orderBy: { createdAt: "desc" },
	});
}
