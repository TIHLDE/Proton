"use server";

import type { User } from "@prisma/client";
import { ArrowRight, PackageOpen, UsersRound } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "~/components/ui/button";
import { H1, H2, P } from "~/components/ui/typography";
import { auth } from "~/lib/auth";
import { getAllOngoingEventsByTeamId, getTeam, hasTeamAccess } from "~/services";
import EventCard from "./_components/event-card";

interface TeamPageProps {
	params: Promise<{ id: string }>;
}

export default async function TeamPage({ params }: TeamPageProps) {
	const { id } = await params;

	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) notFound();

	const membership = await hasTeamAccess(id, session.user as User);

	if (!membership) notFound();

	const team = await getTeam(id);

	if (!team) notFound();

	const events = await getAllOngoingEventsByTeamId(id);

	return (
		<div className="mx-auto min-h-screen w-full max-w-7xl space-y-12 px-2 py-24 md:space-y-20 md:py-32 lg:px-12">
			<div className="space-y-4 md:flex md:items-center md:justify-between md:space-y-0">
				<div>
					<H1>{team.name}</H1>
				</div>

				<div className="grid grid-cols-2 gap-x-2">
					{membership === "ADMIN" && (
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
				</div>
			</div>

			{events.length === 0 && (
				<div className="mx-auto w-full space-y-12 rounded-lg border bg-card p-20 shadow">
					<PackageOpen className="mx-auto h-16 w-16 stroke-[1px] text-muted-foreground" />
					<div className="space-y-2 text-center">
						<H2>Ingen arrangementer</H2>
						<P>Det finnes ingen kommende arrangementer for dette laget.</P>
					</div>
				</div>
			)}

			{events.length > 0 && (
				<div className="space-y-6">
					<H2>Kommende arrangementer</H2>
					<div className="grid w-full gap-6 md:grid-cols-2 lg:grid-cols-3">
						{events.map((event) => (
							<EventCard key={event.id} event={event} showRegistration={true} />
						))}
					</div>
				</div>
			)}
		</div>
	);
}
