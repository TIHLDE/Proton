"use client";

import { usePathname, useRouter } from "next/navigation";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { eventTypeOptions } from "~/lib/event-presentation";

const ALL = "alle";

interface StatisticsFiltersProps {
	seasons: { id: string; label: string }[];
	groups: { id: string; name: string }[];
	seasonId: string;
	groupId?: string;
	eventType?: string;
}

export default function StatisticsFilters({
	seasons,
	groups,
	seasonId,
	groupId,
	eventType,
}: StatisticsFiltersProps) {
	const router = useRouter();
	const pathname = usePathname();

	// Ikke useSearchParams: den bailer ut til klientrendering, og da havner
	// server og klient på hver sin useId-sekvens — hydreringsfeil på hele sida.
	const setFilter = (key: string, value: string) => {
		const params = new URLSearchParams();
		const current: Record<string, string | undefined> = {
			sesong: seasonId,
			gruppe: groupId,
			type: eventType,
		};
		current[key] = value === ALL ? undefined : value;

		for (const [name, entry] of Object.entries(current)) {
			if (entry) params.set(name, entry);
		}

		router.replace(`${pathname}?${params.toString()}`, { scroll: false });
	};

	return (
		<div className="grid gap-3 sm:grid-cols-3">
			<Select
				items={seasons.map((season) => ({
					value: season.id,
					label: season.label,
				}))}
				value={seasonId}
				onValueChange={(value) => value !== null && setFilter("sesong", value)}
			>
				<SelectTrigger className="w-full" aria-label="Sesong">
					<SelectValue placeholder="Sesong" />
				</SelectTrigger>
				<SelectContent>
					{seasons.map((season) => (
						<SelectItem key={season.id} value={season.id}>
							{season.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			{groups.length > 0 && (
				<Select
					items={[
						{ value: ALL, label: "Hele laget" },
						...groups.map((group) => ({
							value: group.id,
							label: group.name,
						})),
					]}
					value={groupId ?? ALL}
					onValueChange={(value) =>
						value !== null && setFilter("gruppe", value)
					}
				>
					<SelectTrigger className="w-full" aria-label="Undergruppe">
						<SelectValue placeholder="Undergruppe" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value={ALL}>Hele laget</SelectItem>
						{groups.map((group) => (
							<SelectItem key={group.id} value={group.id}>
								{group.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			)}

			<Select
				items={[{ value: ALL, label: "Alle typer" }, ...eventTypeOptions]}
				value={eventType ?? ALL}
				onValueChange={(value) => value !== null && setFilter("type", value)}
			>
				<SelectTrigger className="w-full" aria-label="Type arrangement">
					<SelectValue placeholder="Type" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value={ALL}>Alle typer</SelectItem>
					{eventTypeOptions.map((option) => (
						<SelectItem key={option.value} value={option.value}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
