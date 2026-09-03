"use client";

import type { MatchEventType } from "@prisma/client";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { Skeleton } from "~/components/ui/skeleton";
import { getMatchEventLabel, matchEventOrder } from "~/lib/match-presentation";
import { api } from "~/trpc/react";

interface MatchStatsProps {
	eventId: string;
	eventName: string;
	teamName: string;
	isAdmin: boolean;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export default function MatchStats({
	eventId,
	eventName,
	teamName,
	isAdmin,
	open,
	onOpenChange,
}: MatchStatsProps) {
	const utils = api.useUtils();
	const [homeGoals, setHomeGoals] = useState<string | null>(null);
	const [awayGoals, setAwayGoals] = useState<string | null>(null);
	const [type, setType] = useState<MatchEventType>("GOAL");
	const [userId, setUserId] = useState<string>("");

	const { data: match, isLoading } = api.match.getByEvent.useQuery(
		{ eventId },
		{ enabled: open },
	);

	const { data: players = [] } = api.match.getPlayers.useQuery(
		{ eventId },
		{ enabled: open && isAdmin },
	);

	const refresh = () => utils.match.getByEvent.invalidate({ eventId });

	const { mutate: saveResult, isPending: isSavingResult } =
		api.match.saveResult.useMutation({
			onSuccess: () => {
				toast.success("Resultatet ble lagret.");
				refresh();
			},
			onError: (error) => toast.error(error.message),
		});

	const { mutate: addEvent, isPending: isAddingEvent } =
		api.match.addEvent.useMutation({
			onSuccess: () => {
				setUserId("");
				refresh();
			},
			onError: (error) => toast.error(error.message),
		});

	const { mutate: deleteEvent } = api.match.deleteEvent.useMutation({
		onSuccess: refresh,
		onError: (error) => toast.error(error.message),
	});

	// Feltene følger det lagrede resultatet inntil admin har skrevet i dem.
	const homeValue = homeGoals ?? String(match?.homeGoals ?? 0);
	const awayValue = awayGoals ?? String(match?.awayGoals ?? 0);

	const eventsByType = matchEventOrder
		.map((eventType) => ({
			type: eventType,
			rows: (match?.events ?? []).filter((row) => row.type === eventType),
		}))
		.filter((group) => group.rows.length > 0);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[85vh] overflow-y-auto">
				<DialogHeader>
					{/* Tittelen er en resultattavle: hjemmelag, stilling, motstander
					    — der arrangementsnavnet er motstanderen, slik feltene i
					    «Resultat» under også bruker det. Er ingen stilling ført,
					    utelates den. Før sto det «? – ?» i stedet, som leste som
					    om noe manglet i stedet for at kampen ikke er ført enda. */}
					<DialogTitle>
						{match?.hasResult
							? `${teamName} ${match.homeGoals} – ${match.awayGoals} ${eventName}`
							: `${teamName} – ${eventName}`}
					</DialogTitle>
					<DialogDescription>
						Mål, assist, kort og banens beste.
					</DialogDescription>
				</DialogHeader>

				{isLoading && <Skeleton className="h-40 w-full" />}

				{!isLoading && (
					<div className="space-y-6">
						{isAdmin && (
							<div className="space-y-3 rounded-md border p-4">
								<Label>Resultat</Label>
								<div className="flex items-end gap-2">
									<div className="flex-1 space-y-1">
										<Label
											htmlFor={`home-${eventId}`}
											className="font-normal text-muted-foreground text-xs"
										>
											{teamName}
										</Label>
										<Input
											id={`home-${eventId}`}
											inputMode="numeric"
											value={homeValue}
											onChange={(e) => setHomeGoals(e.target.value)}
										/>
									</div>
									<div className="flex-1 space-y-1">
										<Label
											htmlFor={`away-${eventId}`}
											className="font-normal text-muted-foreground text-xs"
										>
											{eventName}
										</Label>
										<Input
											id={`away-${eventId}`}
											inputMode="numeric"
											value={awayValue}
											onChange={(e) => setAwayGoals(e.target.value)}
										/>
									</div>
									<Button
										disabled={isSavingResult}
										onClick={() =>
											saveResult({
												eventId,
												homeGoals: Number(homeValue),
												awayGoals: Number(awayValue),
											})
										}
									>
										Lagre
									</Button>
								</div>
							</div>
						)}

						<div className="space-y-3">
							<Label>Hendelser</Label>
							{eventsByType.length === 0 && (
								<p className="text-muted-foreground text-sm">
									Ingen hendelser er registrert.
								</p>
							)}
							{eventsByType.map((group) => (
								<div key={group.type} className="space-y-1">
									<p className="font-medium text-muted-foreground text-xs">
										{getMatchEventLabel(group.type)}
									</p>
									{group.rows.map((row) => (
										<div
											key={row.id}
											className="flex items-center justify-between gap-2 rounded-md px-2 py-1 text-sm hover:bg-accent"
										>
											<span>{row.user.name}</span>
											{isAdmin && (
												<Button
													variant="ghost"
													size="sm"
													aria-label={`Slett ${getMatchEventLabel(group.type).toLowerCase()} for ${row.user.name}`}
													onClick={() => deleteEvent({ matchEventId: row.id })}
												>
													<Trash2 />
												</Button>
											)}
										</div>
									))}
								</div>
							))}
						</div>

						{isAdmin && (
							<div className="space-y-3 rounded-md border p-4">
								<Label>Ny hendelse</Label>
								<div className="flex flex-col gap-2 sm:flex-row">
									<Select
										items={matchEventOrder.map((eventType) => ({
											value: eventType,
											label: getMatchEventLabel(eventType),
										}))}
										value={type}
										onValueChange={(value) => setType(value as MatchEventType)}
									>
										<SelectTrigger className="w-full sm:w-40">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{matchEventOrder.map((eventType) => (
												<SelectItem key={eventType} value={eventType}>
													{getMatchEventLabel(eventType)}
												</SelectItem>
											))}
										</SelectContent>
									</Select>

									<Select
										items={players.map((player) => ({
											value: player.id,
											label: player.name,
										}))}
										value={userId}
										onValueChange={(value) =>
											value !== null && setUserId(value)
										}
									>
										<SelectTrigger className="flex-1">
											<SelectValue placeholder="Velg spiller" />
										</SelectTrigger>
										<SelectContent>
											{players.map((player) => (
												<SelectItem key={player.id} value={player.id}>
													{player.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>

									<Button
										disabled={!userId || isAddingEvent}
										onClick={() => addEvent({ eventId, userId, type })}
									>
										Legg til
									</Button>
								</div>
							</div>
						)}
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
