"use server";

import { db } from "~/server/db";

export async function getAllTeams() {
	const teams = await db.team.findMany();

	return teams;
}
