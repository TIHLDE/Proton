import { db } from "~/server/db";
import type { EmailContent } from "~/types";
import { sendEmail } from "./email";
import { type PushPayload, sendPushNotification } from "./push";

export type NotificationType =
	| "newEvent"
	| "unansweredEvent"
	| "adminPromotion";
export type PreferenceNotificationType = Exclude<
	NotificationType,
	"adminPromotion"
>;
export type DisabledEmailNotifications = Partial<
	Record<PreferenceNotificationType, true>
>;

export interface NotificationOptions {
	userIds: string[];
	type: NotificationType;
	subject: string;
	emailContent: EmailContent[];
	pushPayload: PushPayload;
}

export const settingsUrl =
	"https://sporty.tihlde.org/min-oversikt/innstillinger";

function categoryEnabled(disabled: unknown, type: NotificationType) {
	if (type === "adminPromotion") return true;
	return !(
		typeof disabled === "object" &&
		disabled !== null &&
		(disabled as Record<string, unknown>)[type] === true
	);
}

export async function sendNotification(options: NotificationOptions) {
	const { userIds, subject, emailContent, pushPayload, type } = options;
	const uniqueUserIds = [...new Set(userIds)];
	if (uniqueUserIds.length === 0) return;

	const users = await db.user.findMany({
		where: {
			id: { in: uniqueUserIds },
		},
		select: {
			email: true,
			emailNotificationsEnabled: true,
			disabledEmailNotifications: true,
		},
	});

	const filteredEmails = users
		.filter(
			(user) =>
				user.emailNotificationsEnabled &&
				categoryEnabled(user.disabledEmailNotifications, type),
		)
		.map((user) => user.email);

	const results = await Promise.allSettled([
		sendEmail([...new Set(filteredEmails)], subject, [
			...emailContent,
			{ type: "button", text: "Endre e-postinnstillinger", url: settingsUrl },
		]),
		sendPushNotification(uniqueUserIds, pushPayload),
	]);
	for (const result of results) {
		if (result.status === "rejected") {
			console.error("Failed to send notification:", result.reason);
		}
	}
}
