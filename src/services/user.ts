"use server";

import { db } from "~/server/db";

export async function getUsersCount(): Promise<number> {
	return await db.user.count();
}

export async function listUsers(page?: number, search?: string) {
	const pageSize = 25;
	const queryPage = page || 1;
	const skip = queryPage ? (queryPage - 1) * pageSize : 0;
	const take = pageSize;

	// Build search where clause
	let searchWhereClause = {};

	if (search && search.length > 0) {
		const words = search.trim().split(" ");

		if (words.length > 1) {
			searchWhereClause = {
				AND: words.map((word) => ({
					OR: [
						{
							email: {
								contains: word,
								mode: "insensitive",
							},
						},
						{
							name: {
								contains: word,
								mode: "insensitive",
							},
						},
					],
				})),
			};
		} else {
			searchWhereClause = {
				OR: [
					{
						email: {
							contains: search,
							mode: "insensitive",
						},
					},
					{
						name: {
							contains: search,
							mode: "insensitive",
						},
					},
				],
			};
		}
	}

	const users = await db.user.findMany({
		where: searchWhereClause,
		orderBy: {
			createdAt: "desc",
		},
		take,
		skip,
	});

	const usersCount = await db.user.count({
		where: searchWhereClause,
	});

	return {
		users,
		nextPage: users.length === pageSize ? queryPage + 1 : null,
		totalPages: Math.ceil(usersCount / pageSize),
	};
}
