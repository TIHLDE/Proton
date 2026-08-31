"use client";

import type { MatchEventType } from "@prisma/client";
import { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { Skeleton } from "~/components/ui/skeleton";
import { P } from "~/components/ui/typography";
import { getMatchEventLabel, matchEventOrder } from "~/lib/match-presentation";
import { api } from "~/trpc/react";

interface MatchStatisticsProps {
	teamId: string;
	seasonId?: string;
	groupId?: string;
}

export default function MatchStatistics({
	teamId,
	seasonId,
	groupId,
}: MatchStatisticsProps) {
	const [type, setType] = useState<MatchEventType>("GOAL");

	const { data: stats, isLoading } = api.match.getStats.useQuery({
		teamId,
		type,
		seasonId,
		groupId,
	});

	return (
		<Card>
			<CardHeader>
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<CardTitle>Kampstatistikk</CardTitle>
						<CardDescription>
							{groupId
								? "Kamper som var åpne for denne undergruppa"
								: "Alle lagets kamper"}
						</CardDescription>
					</div>
					<Select
						items={matchEventOrder.map((eventType) => ({
							value: eventType,
							label: getMatchEventLabel(eventType),
						}))}
						value={type}
						onValueChange={(value) => setType(value as MatchEventType)}
					>
						<SelectTrigger
							className="w-full sm:w-48"
							aria-label="Type hendelse"
						>
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
				</div>
			</CardHeader>
			<CardContent>
				{isLoading && <Skeleton className="h-40 w-full" />}

				{!isLoading && (!stats || stats.length === 0) && (
					<P className="py-8 text-center text-muted-foreground">
						Ingen {getMatchEventLabel(type).toLowerCase()} er registrert med
						denne filtreringen.
					</P>
				)}

				{!isLoading && stats && stats.length > 0 && (
					<div className="space-y-2">
						{stats.map((stat, index) => (
							<div
								key={stat.userId}
								className="flex items-center justify-between rounded-lg border p-4"
							>
								<div className="flex items-center gap-4">
									<div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted font-bold text-sm">
										{index + 1}
									</div>
									<P className="font-medium">{stat.userName}</P>
								</div>
								<P className="font-bold">{stat.count}</P>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
