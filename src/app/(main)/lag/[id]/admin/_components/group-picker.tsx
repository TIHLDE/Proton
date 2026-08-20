"use client";

import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import { api } from "~/trpc/react";

interface GroupPickerProps {
	teamId: string;
	value: string[];
	onChange: (groupIds: string[]) => void;
}

/**
 * Velger hvilke undergrupper arrangementet er åpent for. Ingenting huket av
 * betyr hele laget — det er standarden, og den vanligste.
 */
export default function GroupPicker({
	teamId,
	value,
	onChange,
}: GroupPickerProps) {
	const { data: groups = [], isLoading } = api.group.getByTeam.useQuery({
		teamId,
	});

	if (isLoading || groups.length === 0) return null;

	const toggle = (groupId: string) => {
		onChange(
			value.includes(groupId)
				? value.filter((id) => id !== groupId)
				: [...value, groupId],
		);
	};

	return (
		<div className="space-y-3 rounded-md border p-4">
			<div className="space-y-1">
				<Label>Åpent for</Label>
				<p className="text-muted-foreground text-xs">
					{value.length === 0
						? "Hele laget kan melde seg på."
						: "Bare medlemmer av de valgte undergruppene kan melde seg på."}
				</p>
			</div>

			<div className="space-y-1">
				{groups.map((group) => (
					<div key={group.id} className="flex items-center gap-3">
						<Checkbox
							id={`group-${group.id}`}
							checked={value.includes(group.id)}
							onCheckedChange={() => toggle(group.id)}
						/>
						<Label
							htmlFor={`group-${group.id}`}
							className="cursor-pointer font-normal"
						>
							{group.name}
							<span className="text-muted-foreground">
								{" "}
								({group.memberCount})
							</span>
						</Label>
					</div>
				))}
			</div>
		</div>
	);
}
