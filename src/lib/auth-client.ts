import {
	genericOAuthClient,
	inferAdditionalFields,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	plugins: [
		// Gir signIn.oauth2, som starter Photon-flyten.
		genericOAuthClient(),
		inferAdditionalFields({
			user: {
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
		}),
	],
});
