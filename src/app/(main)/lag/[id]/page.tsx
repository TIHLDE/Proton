"use server";

import type { User } from "@prisma/client";
import { ArrowRight, BarChart3, PackageOpen, UsersRound } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "~/components/ui/button";
import { H1, H2, P } from "~/components/ui/typography";
import { auth } from "~/lib/auth";
import {
	getAllOngoingEventsByTeamId,
	getAllPastEventsByTeamId,
	getTeam,
	getTeamMembershipRoles,
	hasTeamAccess,
} from "~/services";
import EventCard from "./_components/event-card";
import { ShowPastEventsToggle } from "./_components/show-past-events-toggle";

interface TeamPageProps {
	params: Promise<{ id: string }>;
	searchParams: Promise<{ showPast?: string }>;
}

export default async function TeamPage({
	params,
	searchParams,
}: TeamPageProps) {
	const { id } = await params;
	const { showPast } = await searchParams;
	const showPastEvents = showPast === "true";

	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) notFound();

	const membership = await hasTeamAccess(id, session.user as User);

	if (!membership) notFound();

	const team = await getTeam(id);

	if (!team) notFound();

	const events = showPastEvents
		? await getAllPastEventsByTeamId(id)
		: await getAllOngoingEventsByTeamId(id);
	const roles = await getTeamMembershipRoles(session.user.id, id);

	return (
		<div className="mx-auto min-h-screen w-full max-w-7xl space-y-12 px-2 py-24 md:space-y-20 md:py-32 lg:px-12">
			<div className="space-y-4 md:flex md:items-center md:justify-between md:space-y-0">
				<div>
					<H1>{team.name}</H1>
				</div>

				<div className="grid grid-cols-2 gap-x-2 md:grid-cols-3">
					{(roles.includes("ADMIN") ||
						roles.includes("SUBADMIN") ||
						session.user.isAdmin) && (
						<Button asChild>
							<Link href={`/lag/${team.id}/admin`}>
								Administrer lag
								<ArrowRight />
							</Link>
						</Button>
					)}
					<Button asChild variant="outline">
						<Link href={`/lag/${team.id}/medlemmer`}>
							<UsersRound />
							Medlemmer
						</Link>
					</Button>
					<Button asChild variant="outline">
						<Link href={`/lag/${team.id}/statistikk`}>
							<BarChart3 />
							Statistikk
						</Link>
					</Button>
				</div>
			</div>

			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<H2>
						{showPastEvents
							? "Tidligere arrangementer"
							: "Kommende arrangementer"}
					</H2>
					<ShowPastEventsToggle checked={showPastEvents} />
				</div>

				{events.length === 0 && (
					<div className="mx-auto w-full space-y-12 rounded-lg border bg-card p-20 shadow">
						<PackageOpen className="mx-auto h-16 w-16 stroke-[1px] text-muted-foreground" />
						<div className="space-y-2 text-center">
							<H2>Ingen arrangementer</H2>
							<P>
								{showPastEvents
									? "Det finnes ingen tidligere arrangementer for dette laget."
									: "Det finnes ingen kommende arrangementer for dette laget."}
							</P>
						</div>
					</div>
				)}

				{events.length > 0 && (
					<div className="grid w-full gap-6 md:grid-cols-2 lg:grid-cols-3">
						{events.map((event) => (
							<EventCard
								key={event.id}
								event={event}
								showRegistration={!showPastEvents}
								isAdmin={
									session.user.isAdmin ||
									roles.includes("ADMIN") ||
									roles.includes("SUBADMIN")
								}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
