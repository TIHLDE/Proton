"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

export function RsvpToast() {
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const router = useRouter();
	const processedRef = useRef<string | null>(null);

	useEffect(() => {
		const rsvp = searchParams.get("rsvp");
		const key = searchParams.toString();
		if (!rsvp || processedRef.current === key) return;

		processedRef.current = key;

		if (rsvp === "ATTENDING") {
			toast.success("Du er påmeldt!");
		} else if (rsvp === "NOT_ATTENDING") {
			toast.info("Du er avmeldt.");
		}

		const params = new URLSearchParams(searchParams.toString());
		params.delete("rsvp");
		const search = params.size > 0 ? `?${params.toString()}` : "";
		router.replace(`${pathname}${search}`, { scroll: false });
	}, [searchParams, pathname, router]);

	return null;
}
