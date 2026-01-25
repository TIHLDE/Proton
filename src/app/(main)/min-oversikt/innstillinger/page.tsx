import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { NotificationSettings } from "~/components/notification-settings";
import { H1, P } from "~/components/ui/typography";
import { auth } from "~/lib/auth";

export default async function SettingsPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) redirect("/");

	return (
		<div className="mx-auto min-h-screen w-full max-w-7xl space-y-12 px-2 py-24 md:space-y-20 md:py-32 lg:px-12">
			<div className="space-y-4">
				<H1>Innstillinger</H1>
				<P>Administrer dine varslings- og kontoinnstillinger</P>
			</div>

			<div className="max-w-2xl space-y-6">
				<NotificationSettings />
			</div>
		</div>
	);
}
