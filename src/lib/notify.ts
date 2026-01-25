import type { EmailContent } from "~/types";
import { sendEmail } from "./email";
import { type PushPayload, sendPushNotification } from "./push";

export interface NotificationOptions {
	userIds: string[];
	emails: string[];
	subject: string;
	emailContent: EmailContent[];
	pushPayload: PushPayload;
}

export async function sendNotification(options: NotificationOptions) {
	const { userIds, emails, subject, emailContent, pushPayload } = options;

	await Promise.all([
		sendEmail(emails, subject, emailContent),
		sendPushNotification(userIds, pushPayload),
	]);
}
