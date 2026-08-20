"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";

const ALL = "alle";

const eventTypeOptions = [
	{ value: "TRAINING", label: "Trening" },
	{ value: "MATCH", label: "Kamp" },
	{ value: "SOCIAL", label: "Sosialt" },
	{ value: "OTHER", label: "Annet" },
];

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
	const searchParams = useSearchParams();

	const setFilter = (key: string, value: string) => {
		const params = new URLSearchParams(searchParams.toString());
		if (value === ALL) {
			params.delete(key);
		} else {
			params.set(key, value);
		}
		router.replace(`${pathname}?${params.toString()}`, { scroll: false });
	};

	return (
		<div className="grid gap-3 sm:grid-cols-3">
			<Select
				value={seasonId}
				onValueChange={(value) => setFilter("sesong", value)}
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
					value={groupId ?? ALL}
					onValueChange={(value) => setFilter("gruppe", value)}
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
				value={eventType ?? ALL}
				onValueChange={(value) => setFilter("type", value)}
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
