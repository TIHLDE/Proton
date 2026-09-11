"use client";

import { Bell, BellOff, Mail, Send } from "lucide-react";
import { toast } from "sonner";
import { usePushNotifications } from "~/hooks/use-push-notifications";
import { api } from "~/trpc/react";
import { Button } from "./ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "./ui/card";
import { Switch } from "./ui/switch";

export function NotificationSettings() {
	const { isSupported, isSubscribed, isLoading, subscribe, unsubscribe } =
		usePushNotifications();

	const utils = api.useUtils();
	const getEmailStatusQuery = api.email.getStatus.useQuery();
	const updateEmailStatusMutation = api.email.updateStatus.useMutation({
		onSuccess: async (_data, status) => {
			await utils.email.getStatus.cancel();
			utils.email.getStatus.setData(undefined, status);
		},
		onError: () => toast.error("Kunne ikke lagre e-postinnstillingene."),
	});
	const sendTestMutation = api.push.sendTest.useMutation();
	const sendEmailTestMutation = api.email.sendTest.useMutation({
		onError: () => toast.error("Kunne ikke sende test-e-posten."),
	});

	const status = getEmailStatusQuery.data;
	const emailNotificationsEnabled = status?.emailNotificationsEnabled ?? false;
	const newEventNotificationsEnabled =
		status?.disabledEmailNotifications.newEvent !== true;
	const unansweredEventNotificationsEnabled =
		status?.disabledEmailNotifications.unansweredEvent !== true;
	const isLoadingEmail =
		!status ||
		getEmailStatusQuery.isFetching ||
		updateEmailStatusMutation.isPending;

	const handleTogglePush = async () => {
		if (isSubscribed) {
			await unsubscribe();
		} else {
			await subscribe();
		}
	};

	const handleToggleEmail = (
		key: "master" | "newEvent" | "unansweredEvent",
		checked: boolean,
	) => {
		if (!status || isLoadingEmail) return;
		const disabledEmailNotifications = { ...status.disabledEmailNotifications };
		if (key !== "master") {
			if (checked) delete disabledEmailNotifications[key];
			else disabledEmailNotifications[key] = true;
		}
		updateEmailStatusMutation.mutate({
			emailNotificationsEnabled:
				key === "master" ? checked : emailNotificationsEnabled,
			disabledEmailNotifications,
		});
	};

	const handleSendTest = () => {
		sendTestMutation.mutate();
	};

	const handleSendEmailTest = () => {
		sendEmailTestMutation.mutate();
	};

	return (
		<div className="space-y-6">
			{isSupported && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Bell className="h-5 w-5" />
							Push-varsler
						</CardTitle>
						<CardDescription>
							Motta varsler om nye arrangementer og påminnelser direkte i
							nettleseren din.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<p className="font-medium text-sm">Aktiver push-varsler</p>
								<p className="text-muted-foreground text-sm">
									{isSubscribed
										? "Du mottar push-varsler"
										: "Du mottar ikke push-varsler"}
								</p>
							</div>
							<Switch
								checked={isSubscribed}
								aria-label="Aktiver push-varsler"
								onCheckedChange={handleTogglePush}
								disabled={isLoading}
							/>
						</div>

						{isSubscribed && (
							<Button
								variant="outline"
								onClick={handleSendTest}
								disabled={sendTestMutation.isPending}
							>
								<Send className="mr-2 h-4 w-4" />
								Send test-varsel
							</Button>
						)}
					</CardContent>
				</Card>
			)}

			{!isSupported && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<BellOff className="h-5 w-5" />
							Push-varsler
						</CardTitle>
						<CardDescription>
							Push-varsler støttes ikke i denne nettleseren.
						</CardDescription>
					</CardHeader>
				</Card>
			)}

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Mail className="h-5 w-5" />
						E-postvarsler
					</CardTitle>
					<CardDescription>
						Motta varsler om nye arrangementer og påminnelser på e-posten din.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<p className="font-medium text-sm">Aktiver e-postvarsler</p>
							<p className="text-muted-foreground text-sm">
								{emailNotificationsEnabled
									? "Du mottar e-postvarsler"
									: "Du mottar ikke e-postvarsler"}
							</p>
						</div>
						<Switch
							checked={emailNotificationsEnabled}
							aria-label="Aktiver e-postvarsler"
							onCheckedChange={(checked) =>
								handleToggleEmail("master", checked)
							}
							disabled={isLoadingEmail}
						/>
					</div>

					{emailNotificationsEnabled && (
						<div className="space-y-3 border-t pt-4">
							<p className="font-medium text-sm">Varseltyper</p>
							{(
								[
									{
										key: "newEvent",
										label: "Nytt arrangement opprettet",
										checked: newEventNotificationsEnabled,
									},
									{
										key: "unansweredEvent",
										label: "Husk å melde deg på arrangement",
										checked: unansweredEventNotificationsEnabled,
									},
								] as const
							).map(({ key, label, checked }) => (
								<div className="flex items-center justify-between" key={key}>
									<span className="text-sm">{label}</span>
									<Switch
										checked={checked}
										aria-label={label}
										onCheckedChange={(checked) =>
											handleToggleEmail(key, checked)
										}
										disabled={isLoadingEmail}
									/>
								</div>
							))}
						</div>
					)}

					{emailNotificationsEnabled && (
						<div>
							<p className="mb-3 text-muted-foreground text-sm">
								Test-e-posten er tilgjengelig når e-postvarsler er aktivert.
							</p>
							<Button
								variant="outline"
								onClick={handleSendEmailTest}
								disabled={isLoadingEmail || sendEmailTestMutation.isPending}
							>
								<Send className="mr-2 h-4 w-4" />
								Send test-e-post
							</Button>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
