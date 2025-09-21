import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { env } from "~/env";
import { db } from "~/server/db";

export const auth = betterAuth({
	secret: env.BETTER_AUTH_SECRET,
	database: prismaAdapter(db, {
		provider: "postgresql",
	}),
	emailAndPassword: {
		enabled: true,
	},
	session: {
		expiresIn: 60 * 60 * 24 * 120, // 120 days,
		updateAge: 60 * 60 * 24,
	},
	user: {
		additionalFields: {
			username: {
				type: "string",
				required: true,
				unique: true,
			},
			isAdmin: {
				type: "boolean",
				required: true,
				default: false,
			},
		},
	},
	trustedOrigins: ["*"],
	plugins: [nextCookies()],
});
