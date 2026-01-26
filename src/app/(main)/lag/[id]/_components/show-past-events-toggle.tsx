"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";

interface ShowPastEventsToggleProps {
	checked: boolean;
}

export function ShowPastEventsToggle({ checked }: ShowPastEventsToggleProps) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const handleCheckedChange = (isChecked: boolean) => {
		const params = new URLSearchParams(searchParams.toString());

		if (isChecked) {
			params.set("showPast", "true");
		} else {
			params.delete("showPast");
		}

		router.push(`${pathname}?${params.toString()}`);
	};

	return (
		<div className="flex items-center gap-2">
			<Label htmlFor="show-past-events" className="cursor-pointer text-sm">
				Vis tidligere arrangementer
			</Label>
			<Switch
				id="show-past-events"
				checked={checked}
				onCheckedChange={handleCheckedChange}
			/>
		</div>
	);
}
