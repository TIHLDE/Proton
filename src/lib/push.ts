import webPush from "web-push";
import { env } from "~/env";
import { db } from "~/server/db";

export interface PushPayload {
	title: string;
	body: string;
	url?: string;
}

const VAPID_PUBLIC_KEY = env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = env.VAPID_PRIVATE_KEY;

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
	webPush.setVapidDetails(
		"mailto:sporty@tihlde.org",
		VAPID_PUBLIC_KEY,
		VAPID_PRIVATE_KEY,
	);
}

export async function sendPushNotification(
	userIds: string[],
	payload: PushPayload,
) {
	if (env.NODE_ENV !== "production") return;

	if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
		console.warn("VAPID keys not configured, skipping push notifications");
		return;
	}

	const subscriptions = await db.pushSubscription.findMany({
		where: {
			userId: { in: userIds },
		},
	});

	const invalidSubscriptionIds: string[] = [];

	await Promise.all(
		subscriptions.map(async (subscription) => {
			try {
				await webPush.sendNotification(
					{
						endpoint: subscription.endpoint,
						keys: {
							p256dh: subscription.p256dh,
							auth: subscription.auth,
						},
					},
					JSON.stringify(payload),
				);
			} catch (error) {
				const webPushError = error as { statusCode?: number };
				if (
					webPushError.statusCode === 410 ||
					webPushError.statusCode === 404
				) {
					invalidSubscriptionIds.push(subscription.id);
				} else {
					console.error(
						`Failed to send push notification to ${subscription.endpoint}:`,
						error,
					);
				}
			}
		}),
	);

	if (invalidSubscriptionIds.length > 0) {
		await db.pushSubscription.deleteMany({
			where: { id: { in: invalidSubscriptionIds } },
		});
	}
}
