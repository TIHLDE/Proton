"use client";

import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { useIsMobile } from "~/hooks/use-mobile";
import { usePushNotifications } from "~/hooks/use-push-notifications";
import { Button } from "./ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "./ui/dialog";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
} from "./ui/drawer";

const COOKIE_NAME = "notification-prompt-shown";

function getCookie(name: string): string | null {
	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);
	if (parts.length === 2) return parts.pop()?.split(";").shift() ?? null;
	return null;
}

function setCookie(name: string, value: string, days: number) {
	const expires = new Date();
	expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
	document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

interface NotificationPromptProps {
	isLoggedIn: boolean;
}

export function NotificationPrompt({ isLoggedIn }: NotificationPromptProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const isMobile = useIsMobile();
	const {
		isSupported,
		isSubscribed,
		isLoading: isPushLoading,
		registration,
		subscribe,
	} = usePushNotifications();

	// On mobile, only show if running as PWA (has service worker registration)
	const isPWA = !!registration;
	const shouldShowOnMobile = isMobile && isPWA;
	const shouldShowOnDesktop = !isMobile;
	const canShow = shouldShowOnMobile || shouldShowOnDesktop;

	useEffect(() => {
		if (isPushLoading || !isLoggedIn) return;

		const cookieValue = getCookie(COOKIE_NAME);
		const shouldShowPrompt = !cookieValue || cookieValue === "false";

		if (shouldShowPrompt && isSupported && !isSubscribed && canShow) {
			const timer = setTimeout(() => {
				setIsOpen(true);
			}, 1000);
			return () => clearTimeout(timer);
		}
	}, [isSupported, isSubscribed, isPushLoading, canShow, isLoggedIn]);

	const handleConfirm = async () => {
		setIsLoading(true);
		await subscribe();
		setCookie(COOKIE_NAME, "true", 365);
		setIsLoading(false);
		setIsOpen(false);
	};

	const handleDecline = () => {
		setCookie(COOKIE_NAME, "true", 365);
		setIsOpen(false);
	};

	const content = (
		<div className="flex flex-col gap-4">
			<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
				<Bell className="h-6 w-6 text-primary" />
			</div>
			<div className="flex flex-col gap-2">
				<Button onClick={handleConfirm} disabled={isLoading}>
					{isLoading ? "Aktiverer..." : "Aktiver varsler"}
				</Button>
				<Button variant="ghost" onClick={handleDecline} disabled={isLoading}>
					Ikke nå
				</Button>
			</div>
		</div>
	);

	if (!isLoggedIn || !isSupported || isSubscribed || !canShow) {
		return null;
	}

	if (isMobile) {
		return (
			<Drawer open={isOpen} onOpenChange={setIsOpen}>
				<DrawerContent>
					<DrawerHeader className="text-center">
						<DrawerTitle>Hold deg oppdatert</DrawerTitle>
						<DrawerDescription>
							Få varsler om nye arrangementer og påminnelser direkte på enheten
							din.
						</DrawerDescription>
					</DrawerHeader>
					<div className="p-4 pb-8">{content}</div>
				</DrawerContent>
			</Drawer>
		);
	}

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogContent showCloseButton={false}>
				<DialogHeader className="text-center">
					<DialogTitle>Hold deg oppdatert</DialogTitle>
					<DialogDescription>
						Få varsler om nye arrangementer og påminnelser direkte på enheten
						din.
					</DialogDescription>
				</DialogHeader>
				{content}
			</DialogContent>
		</Dialog>
	);
}
