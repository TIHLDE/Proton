import { db } from "~/server/db";
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

	// Filter out users who have disabled email notifications
	const usersWithEmailEnabled = await db.user.findMany({
		where: {
			id: { in: userIds },
			emailNotificationsEnabled: true,
		},
		select: {
			email: true,
		},
	});

	const filteredEmails = usersWithEmailEnabled.map((user) => user.email);

	await Promise.all([
		sendEmail([...emails, ...filteredEmails], subject, emailContent),
		sendPushNotification(userIds, pushPayload),
	]);
}
