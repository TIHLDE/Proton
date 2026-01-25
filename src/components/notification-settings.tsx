"use client";

import { Bell, BellOff, Send } from "lucide-react";
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

	const sendTestMutation = api.push.sendTest.useMutation();

	const handleToggle = async () => {
		if (isSubscribed) {
			await unsubscribe();
		} else {
			await subscribe();
		}
	};

	const handleSendTest = () => {
		sendTestMutation.mutate();
	};

	if (!isSupported) {
		return (
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
		);
	}

	return (
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
						onCheckedChange={handleToggle}
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
	);
}
