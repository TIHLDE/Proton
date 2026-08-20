import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";

/**
 * Sikrer at undergruppene faktisk hører til laget, slik at et arrangement
 * ikke kan åpnes for en gruppe i et annet lag.
 */
export async function validateGroupIds(
	teamId: string,
	groupIds: string[],
): Promise<string[]> {
	if (groupIds.length === 0) return [];

	const unique = [...new Set(groupIds)];

	const groups = await db.teamGroup.findMany({
		where: { id: { in: unique }, teamId },
		select: { id: true },
	});

	if (groups.length !== unique.length) {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: "Én eller flere undergrupper hører ikke til dette laget.",
		});
	}

	return unique;
}
