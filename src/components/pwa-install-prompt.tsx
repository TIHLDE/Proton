"use client";

import { Download, Ellipsis, Plus, Share } from "lucide-react";
import { useEffect, useState } from "react";
import { useIsMobile } from "~/hooks/use-mobile";
import { Button } from "./ui/button";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
} from "./ui/drawer";

const COOKIE_NAME = "pwa-install-prompt-shown";

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

type OS = "ios" | "android" | "other";

function getOS(): OS {
	if (typeof window === "undefined") return "other";

	const userAgent = navigator.userAgent.toLowerCase();

	if (/iphone|ipad|ipod/.test(userAgent)) {
		return "ios";
	}

	if (/android/.test(userAgent)) {
		return "android";
	}

	return "other";
}

function isStandalone(): boolean {
	if (typeof window === "undefined") return false;

	// Check if running as PWA
	const isStandaloneMode =
		window.matchMedia("(display-mode: standalone)").matches ||
		(window.navigator as Navigator & { standalone?: boolean }).standalone ===
			true;

	return isStandaloneMode;
}

interface BeforeInstallPromptEvent extends Event {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface PWAInstallPromptProps {
	isLoggedIn: boolean;
}

export function PWAInstallPrompt({ isLoggedIn }: PWAInstallPromptProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [os, setOS] = useState<OS>("other");
	const [deferredPrompt, setDeferredPrompt] =
		useState<BeforeInstallPromptEvent | null>(null);
	const [isInstalling, setIsInstalling] = useState(false);
	const isMobile = useIsMobile();

	useEffect(() => {
		setOS(getOS());

		const handleBeforeInstallPrompt = (e: Event) => {
			e.preventDefault();
			setDeferredPrompt(e as BeforeInstallPromptEvent);
		};

		window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

		return () => {
			window.removeEventListener(
				"beforeinstallprompt",
				handleBeforeInstallPrompt,
			);
		};
	}, []);

	useEffect(() => {
		if (!isLoggedIn || !isMobile) return;

		// Don't show if already running as PWA
		if (isStandalone()) return;

		// Only show on iOS or Android
		if (os !== "ios" && os !== "android") return;

		const cookieValue = getCookie(COOKIE_NAME);
		const shouldShowPrompt = !cookieValue || cookieValue === "false";

		if (shouldShowPrompt) {
			const timer = setTimeout(() => {
				setIsOpen(true);
			}, 2000);
			return () => clearTimeout(timer);
		}
	}, [isLoggedIn, isMobile, os]);

	const handleInstall = async () => {
		if (!deferredPrompt) return;

		setIsInstalling(true);
		await deferredPrompt.prompt();

		const { outcome } = await deferredPrompt.userChoice;
		if (outcome === "accepted") {
			setCookie(COOKIE_NAME, "true", 365);
		}

		setDeferredPrompt(null);
		setIsInstalling(false);
		setIsOpen(false);
	};

	const handleDismiss = () => {
		setCookie(COOKIE_NAME, "true", 365);
		setIsOpen(false);
	};

	// Don't render if not mobile, not logged in, running as PWA, or not iOS/Android
	if (!isMobile || !isLoggedIn || isStandalone() || os === "other") {
		return null;
	}

	return (
		<Drawer open={isOpen} onOpenChange={setIsOpen}>
			<DrawerContent>
				<DrawerHeader className="text-center">
					<DrawerTitle>Installer Sporty</DrawerTitle>
					<DrawerDescription>
						Installer appen for en bedre opplevelse med raskere tilgang og
						push-varsler.
					</DrawerDescription>
				</DrawerHeader>
				<div className="p-4 pb-8">
					<div className="flex flex-col gap-4">
						<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
							<Download className="h-6 w-6 text-primary" />
						</div>

						{os === "ios" && (
							<div className="space-y-3 rounded-lg bg-muted p-4">
								<p className="text-center font-medium text-sm">
									Slik installerer du på iOS Safari:
								</p>
								<ol className="space-y-2 text-muted-foreground text-sm">
									<li className="flex items-center gap-2">
										<span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
											1
										</span>
										<span>
											Trykk på <Ellipsis className="inline h-4 w-4" /> de tre
											prikkene nederst til høyre
										</span>
									</li>
									<li className="flex items-center gap-2">
										<span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
											2
										</span>
										<span>
											Trykk på <Share className="inline h-4 w-4" /> Del-knappen
										</span>
									</li>
									<li className="flex items-center gap-2">
										<span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
											3
										</span>
										<span>
											Trykk på <Ellipsis className="inline h-4 w-4" /> "Mer"
										</span>
									</li>
									<li className="flex items-center gap-2">
										<span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
											4
										</span>
										<span>Velg "Legg til på Hjem-skjerm"</span>
									</li>
								</ol>
							</div>
						)}

						{os === "android" && deferredPrompt && (
							<Button onClick={handleInstall} disabled={isInstalling}>
								<Download className="mr-2 h-4 w-4" />
								{isInstalling ? "Installerer..." : "Installer appen"}
							</Button>
						)}

						{os === "android" && !deferredPrompt && (
							<div className="space-y-3 rounded-lg bg-muted p-4">
								<p className="text-center font-medium text-sm">
									Slik installerer du på Android:
								</p>
								<ol className="space-y-2 text-muted-foreground text-sm">
									<li className="flex items-center gap-2">
										<span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
											1
										</span>
										<span>Trykk på menyen (⋮) øverst til høyre</span>
									</li>
									<li className="flex items-center gap-2">
										<span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
											2
										</span>
										<span>
											Velg «Installer app» eller «Legg til på startskjermen»
										</span>
									</li>
								</ol>
							</div>
						)}

						<div className="flex flex-col gap-2">
							{os === "ios" && (
								<Button onClick={handleDismiss}>Jeg forstår</Button>
							)}
							<Button variant="ghost" onClick={handleDismiss}>
								Ikke nå
							</Button>
						</div>
					</div>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
