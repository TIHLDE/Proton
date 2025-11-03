import { env } from "~/env";
import type { EmailContent } from "~/types";

export async function sendEmail(
	to: string[],
	subject: string,
	content: EmailContent[],
) {
	try {
		await Promise.all(
			to.map(async (recipient) => {
				const response = await fetch(
					"https://photon.tihlde.org/api/email/send",
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${env.EMAIL_API_KEY}`,
						},
						body: JSON.stringify({
							to: recipient,
							subject,
							content,
						}),
					},
				);

				if (!response.ok) {
					console.log(await response.text());
					throw new Error(
						`Failed to send email to ${recipient}: ${response.statusText}`,
					);
				}
			}),
		);
	} catch (error) {
		console.error("Failed to send email:", error);
	}
}
