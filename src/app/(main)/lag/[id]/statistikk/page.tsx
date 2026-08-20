"use server";

import type { User } from "@prisma/client";
import { ArrowLeft } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "~/components/ui/button";
import { H1 } from "~/components/ui/typography";
import { auth } from "~/lib/auth";
import { getSeasonForDate, getSeasons } from "~/lib/season";
import { db } from "~/server/db";
import {
	getTeam,
	getTeamGroups,
	getTeamMembershipRoles,
	hasTeamAccess,
} from "~/services";
import AttendanceStats from "./_components/attendance-stats";
import MatchStatistics from "./_components/match-statistics";
import StatisticsFilters from "./_components/statistics-filters";

type EventTypeFilter = "TRAINING" | "MATCH" | "SOCIAL" | "OTHER";

const eventTypes: EventTypeFilter[] = ["TRAINING", "MATCH", "SOCIAL", "OTHER"];

interface TeamStatistikkPageProps {
	params: Promise<{ id: string }>;
	searchParams: Promise<{
		sesong?: string;
		gruppe?: string;
		type?: string;
	}>;
}

export default async function TeamStatistikkPage({
	params,
	searchParams,
}: TeamStatistikkPageProps) {
	const { id } = await params;
	const { sesong, gruppe, type } = await searchParams;

	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) notFound();

	const membership = await hasTeamAccess(id, session.user as User);

	if (!membership) notFound();

	const team = await getTeam(id);

	if (!team) notFound();

	const roles = await getTeamMembershipRoles(session.user.id, id);
	const isAdmin =
		session.user.isAdmin ||
		roles.includes("ADMIN") ||
		roles.includes("SUBADMIN");

	// Sesongene regnes ut på serveren og sendes ned ferdige. Regnes de ut
	// begge steder, spriker de mellom en UTC-server og en nettleser i Oslo.
	const firstEvent = await db.teamEvent.findFirst({
		where: { teamId: id },
		orderBy: { startAt: "asc" },
		select: { startAt: true },
	});

	const seasons = getSeasons(firstEvent?.startAt ?? new Date());
	const currentSeasonId = getSeasonForDate(new Date()).id;
	const seasonId =
		sesong && seasons.some((season) => season.id === sesong)
			? sesong
			: (seasons[0]?.id ?? currentSeasonId);

	const groups = await getTeamGroups(id);
	const groupId = groups.some((group) => group.id === gruppe)
		? gruppe
		: undefined;
	const eventType = eventTypes.includes(type as EventTypeFilter)
		? (type as EventTypeFilter)
		: undefined;

	return (
		<div className="mx-auto min-h-screen w-full max-w-7xl space-y-12 px-2 py-24 md:space-y-20 md:py-32 lg:px-12">
			<div className="space-y-4">
				<Button asChild variant="ghost" size="sm">
					<Link href={`/lag/${id}`}>
						<ArrowLeft />
						Tilbake til {team.name}
					</Link>
				</Button>
				<H1>Statistikk - {team.name}</H1>
			</div>

			<StatisticsFilters
				seasons={seasons.map((season) => ({
					id: season.id,
					label: season.label,
				}))}
				groups={groups.map((group) => ({ id: group.id, name: group.name }))}
				seasonId={seasonId}
				groupId={groupId}
				eventType={eventType}
			/>

			<MatchStatistics teamId={id} seasonId={seasonId} groupId={groupId} />

			<AttendanceStats
				teamId={id}
				isAdmin={isAdmin}
				seasonId={seasonId}
				groupId={groupId}
				eventType={eventType}
			/>
		</div>
	);
}
