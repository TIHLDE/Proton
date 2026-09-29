"use client";

import { ListFilterIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "~/components/ui/popover";

interface TeamFilterTeam {
	id: string;
	name: string;
	emoji: string | null;
}

interface TeamFilterProps {
	teams: TeamFilterTeam[];
	selectedTeamIds: string[] | null;
	onChange: (teamIds: string[] | null) => void;
}

// null = ingen filter aktivt, alle lag vises. Tomt array ville sett ut som
// "vis ingenting", som ikke er noe en bruker faktisk vil ha.
export default function TeamFilter({
	teams,
	selectedTeamIds,
	onChange,
}: TeamFilterProps) {
	if (teams.length < 2) return null;

	const isSelected = (teamId: string) =>
		selectedTeamIds === null || selectedTeamIds.includes(teamId);

	const toggle = (teamId: string) => {
		const current = selectedTeamIds ?? teams.map((team) => team.id);
		const next = current.includes(teamId)
			? current.filter((id) => id !== teamId)
			: [...current, teamId];

		onChange(next.length === teams.length ? null : next);
	};

	const activeCount = selectedTeamIds?.length ?? teams.length;

	return (
		<Popover>
			<PopoverTrigger
				render={
					<Button variant="outline" aria-label="Filtrer på lag">
						<ListFilterIcon className="size-4" />
						{selectedTeamIds !== null && (
							<span className="text-xs">{activeCount}</span>
						)}
					</Button>
				}
			/>
			<PopoverContent className="w-64" align="start">
				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<span className="font-medium text-sm">Vis lag</span>
						{selectedTeamIds !== null && (
							<Button
								variant="link"
								className="h-auto p-0 text-xs"
								onClick={() => onChange(null)}
							>
								Vis alle
							</Button>
						)}
					</div>
					<div className="space-y-2">
						{teams.map((team) => (
							<div key={team.id} className="flex items-center gap-3">
								<Checkbox
									id={`team-filter-${team.id}`}
									checked={isSelected(team.id)}
									onCheckedChange={() => toggle(team.id)}
								/>
								<Label
									htmlFor={`team-filter-${team.id}`}
									className="cursor-pointer font-normal"
								>
									{team.emoji && <span>{team.emoji} </span>}
									{team.name}
								</Label>
							</div>
						))}
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}
