"use server";

import { cookies } from "next/headers";
import type { z } from "zod";
import { SignInInputSchema } from "~/schemas";
import { db } from "~/server/db";
import type { MembershipResponse, TIHLDEUser } from "~/types";

export interface ActionResponse<T> {
	fieldError?: Partial<Record<keyof T, string | undefined>>;
	formError?: string;
	userData?: {
		fullName: string;
		email: string;
		username: string;
		isNewUser: boolean;
	};
}

export async function login(
	formData: FormData,
): Promise<ActionResponse<z.infer<typeof SignInInputSchema>>> {
	const obj = Object.fromEntries(formData.entries());

	const parsed = SignInInputSchema.safeParse(obj);
	if (!parsed.success) {
		const err = parsed.error.flatten();
		return {
			fieldError: {
				username: err.fieldErrors.username?.[0],
				password: err.fieldErrors.password?.[0],
			},
		};
	}

	const { username, password } = parsed.data;

	// Call Lepton API
	try {
		const response = await fetch("https://api.tihlde.org/auth/login/", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ user_id: username, password }),
		});

		const data = await response.json();
		if (!response.ok) {
			throw new Error(data.detail);
		}

		const userData = await getMyUserInfo(data.token);
		if (!userData) {
			throw new Error("Kunne ikke hente brukerdata.");
		}

		// Add token to user in cookies
		const cookiesStore = await cookies();
		cookiesStore.set("tihlde_token", data.token, { httpOnly: true, path: "/" });

		// Check if user exists
		const existingUser = await db.user.findUnique({
			where: {
				email: userData.email,
				username: userData.user_id,
			},
		});

		// If not, create user
		if (!existingUser) {
			return {
				userData: {
					fullName: `${userData.first_name} ${userData.last_name}`,
					email: userData.email,
					username: userData.user_id,
					isNewUser: true,
				},
			};
		}

		return {
			userData: {
				fullName: `${userData.first_name} ${userData.last_name}`,
				email: userData.email,
				username: userData.user_id,
				isNewUser: false,
			},
		};
	} catch (e) {
		if (e instanceof Error) {
			return {
				formError: e.message,
			};
		}
		return {
			formError: "Det oppstod en feil under innlogging. Prøv igjen senere.",
		};
	}
}

export async function getUserInfo(
	username: string,
): Promise<TIHLDEUser | null> {
	if (!username) {
		return null;
	}

	const response = await fetch(`https://api.tihlde.org/users/${username}/`, {
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		return null;
	}

	return await response.json();
}

export async function getMyUserInfo(token: string): Promise<TIHLDEUser | null> {
	if (!token) {
		return null;
	}

	const response = await fetch("https://api.tihlde.org/users/me/", {
		headers: {
			"x-csrf-token": token,
		},
	});

	if (!response.ok) {
		return null;
	}

	return await response.json();
}

export async function getUserMemberships(
	token: string,
): Promise<MembershipResponse | null> {
	if (!token) {
		return null;
	}

	const response = await fetch("https://api.tihlde.org/users/me/memberships/", {
		headers: {
			"x-csrf-token": token,
		},
	});

	if (!response.ok) {
		return null;
	}

	return await response.json();
}

export async function getTIHLDEToken(): Promise<string | null> {
	const cookiesStore = await cookies();
	const token = cookiesStore.get("tihlde_token")?.value;

	return token || null;
}

export async function clearTIHLDEToken() {
	const cookiesStore = await cookies();
	cookiesStore.delete("tihlde_token");
};