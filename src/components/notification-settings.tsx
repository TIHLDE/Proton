"use client";

import { Bell, BellOff, Mail, Send } from "lucide-react";
import { useEffect, useState } from "react";
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
	const [status, setStatus] = useState<
		| "subscribing"
		| "unsubscribing"
		| "failedSubscribing"
		| "failedUnsubscribing"
		| "idle"
		| "unsubscribed"
		| "subscribed"
	>("idle");
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const {
		isSupported,
		isSubscribed,
		isLoading,
		registration,
		subscribe,
		unsubscribe,
	} = usePushNotifications();

	const [emailNotificationsEnabled, setEmailNotificationsEnabled] =
		useState(true);
	const [isLoadingEmail, setIsLoadingEmail] = useState(true);

	const getEmailStatusQuery = api.email.getStatus.useQuery();
	const updateEmailStatusMutation = api.email.updateStatus.useMutation();
	const sendTestMutation = api.push.sendTest.useMutation();
	const sendEmailTestMutation = api.email.sendTest.useMutation();

	useEffect(() => {
		if (getEmailStatusQuery.data) {
			setEmailNotificationsEnabled(
				getEmailStatusQuery.data.emailNotificationsEnabled,
			);
		}
		setIsLoadingEmail(getEmailStatusQuery.isLoading);
	}, [getEmailStatusQuery.data, getEmailStatusQuery.isLoading]);

	const handleTogglePush = async () => {
		setStatus("idle");
		setErrorMessage(null);
		if (isSubscribed) {
			setStatus("unsubscribing");
			const t = await unsubscribe();
			if (t.status) {
				setStatus("unsubscribed");
			} else {
				setStatus("failedUnsubscribing");
				setErrorMessage(t.message);
			}
		} else {
			setStatus("subscribing");
			const t = await subscribe();
			if (t.status) {
				setStatus("subscribed");
			} else {
				setStatus("failedSubscribing");
				setErrorMessage(t.message);
			}
		}
	};

	const handleToggleEmail = async () => {
		setIsLoadingEmail(true);
		try {
			await updateEmailStatusMutation.mutateAsync({
				emailNotificationsEnabled: !emailNotificationsEnabled,
			});
			setEmailNotificationsEnabled(!emailNotificationsEnabled);
		} finally {
			setIsLoadingEmail(false);
		}
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
								<p>{status}</p>
								{errorMessage && (
									<p className="text-red-500 text-sm">{errorMessage}</p>
								)}
							</div>
							<Switch
								checked={isSubscribed}
								onCheckedChange={handleTogglePush}
								disabled={isLoading}
							/>
						</div>

						<div>
							{registration ? (
								<p className="text-muted-foreground text-sm">
									Service Worker registrert med scope: {registration.scope}
								</p>
							) : (
								<p className="text-muted-foreground text-sm">
									Ingen Service Worker registrert.
								</p>
							)}
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
							onCheckedChange={handleToggleEmail}
							disabled={isLoadingEmail}
						/>
					</div>

					{emailNotificationsEnabled && (
						<Button
							variant="outline"
							onClick={handleSendEmailTest}
							disabled={sendEmailTestMutation.isPending}
						>
							<Send className="mr-2 h-4 w-4" />
							Send test-e-post
						</Button>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
