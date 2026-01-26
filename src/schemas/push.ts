import { z } from "zod";

export const PushSubscriptionInputSchema = z.object({
	endpoint: z.string().url(),
	keys: z.object({
		p256dh: z.string(),
		auth: z.string(),
	}),
});

export const UnsubscribePushInputSchema = z.object({
	endpoint: z.string().url(),
});
