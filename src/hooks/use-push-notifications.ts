"use client";

import { useCallback, useEffect, useState } from "react";
import { env } from "~/env";
import { api } from "~/trpc/react";

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
	const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);
	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray as Uint8Array<ArrayBuffer>;
}

export function usePushNotifications() {
	const [isSupported, setIsSupported] = useState(false);
	const [isSubscribed, setIsSubscribed] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [registration, setRegistration] =
		useState<ServiceWorkerRegistration | null>(null);

	const subscribeMutation = api.push.subscribe.useMutation();
	const unsubscribeMutation = api.push.unsubscribe.useMutation();

	useEffect(() => {
		const checkSupport = async () => {
			const supported =
				"serviceWorker" in navigator &&
				"PushManager" in window &&
				"Notification" in window;
			setIsSupported(supported);

			if (supported && navigator.serviceWorker.controller) {
				const reg = await navigator.serviceWorker.ready;
				setRegistration(reg);

				const subscription = await reg.pushManager.getSubscription();
				setIsSubscribed(!!subscription);
			}

			setIsLoading(false);
		};

		checkSupport();
	}, []);

	const subscribe = useCallback(async () => {
		if (!registration || !env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) return false;

		try {
			const permission = await Notification.requestPermission();
			if (permission !== "granted") return false;

			const subscription = await registration.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: urlBase64ToUint8Array(
					env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
				),
			});

			const json = subscription.toJSON();
			if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
				throw new Error("Invalid subscription");
			}

			await subscribeMutation.mutateAsync({
				endpoint: json.endpoint,
				keys: {
					p256dh: json.keys.p256dh,
					auth: json.keys.auth,
				},
			});

			setIsSubscribed(true);
			return true;
		} catch (error) {
			console.error("Failed to subscribe to push notifications:", error);
			return false;
		}
	}, [registration, subscribeMutation]);

	const unsubscribe = useCallback(async () => {
		if (!registration) return false;

		try {
			const subscription = await registration.pushManager.getSubscription();
			if (subscription) {
				await unsubscribeMutation.mutateAsync({
					endpoint: subscription.endpoint,
				});
				await subscription.unsubscribe();
			}

			setIsSubscribed(false);
			return true;
		} catch (error) {
			console.error("Failed to unsubscribe from push notifications:", error);
			return false;
		}
	}, [registration, unsubscribeMutation]);

	return {
		isSupported,
		isSubscribed,
		isLoading,
		subscribe,
		unsubscribe,
	};
}
