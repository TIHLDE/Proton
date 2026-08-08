import { useEffect } from "react";

/**
 * Sets or clears the PWA app icon badge using the Badging API.
 * Fails silently on unsupported browsers/platforms.
 *
 * @param count - The badge count. Pass 0 or undefined to clear the badge.
 */
export function usePwaAppBadge(count: number | undefined) {
	useEffect(() => {
		if (typeof navigator === "undefined") return;

		const nav = navigator as Navigator & {
			setAppBadge?: (count?: number) => Promise<void>;
			clearAppBadge?: () => Promise<void>;
		};

		if (count && count > 0) {
			nav.setAppBadge?.(count).catch(() => {});
		} else {
			nav.clearAppBadge?.().catch(() => {});
		}
	}, [count]);
}
