"use server";

import { PackageOpen } from "lucide-react";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { Button } from "~/components/ui/button";
import { H2, P } from "~/components/ui/typography";
import { auth } from "~/lib/auth";
import {
	getAllEventsByTeamId,
	getTeam,
	getTeamMembershipRoles,
} from "~/services";
import EventCard from "../_components/event-card";
import CreateEvent from "./_components/create";
import EditEvent from "./_components/edit";

interface EventPageProps {
	params: Promise<{ id: string }>;
}

export default async function EventsAdminPage({ params }: EventPageProps) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) redirect("/");

	const { id } = await params;
	const roles = await getTeamMembershipRoles(session.user.id, id);
	if (
		!roles.includes("ADMIN") &&
		!session.user.isAdmin &&
		!roles.includes("SUBADMIN")
	)
		notFound();
	const events = await getAllEventsByTeamId(id);
	const team = await getTeam(id);

	return (
		<div className="space-y-12 md:space-y-20">
			<div className="flex items-center justify-between">
				<div>
					<H2>Arrangementer</H2>
					<P>Her kan du administrere alle arrangementene for laget</P>
				</div>

				<CreateEvent teamId={id} />
			</div>

			{events.length === 0 && (
				<div className="mx-auto w-full space-y-12 rounded-lg border bg-card p-20 shadow">
					<PackageOpen className="mx-auto h-16 w-16 stroke-[1px] text-muted-foreground" />
					<div className="space-y-2 text-center">
						<H2>Ingen arrangementer funnet</H2>
						<P>
							Det finnes ingen arrangementer registrert. Trykk på knappen under
							for å opprette et nytt arrangement.
						</P>
					</div>

					<div className="flex justify-center">
						<CreateEvent teamId={id} />
					</div>
				</div>
			)}

			{events.length > 0 && (
				<div className="grid w-full gap-6 md:grid-cols-2 lg:grid-cols-3">
					{events.map((event) => (
						<EventCard
							key={event.id}
							event={event}
							teamName={team?.name}
							actions={<EditEvent event={event} teamId={id} />}
							isAdmin
						/>
					))}
				</div>
			)}
		</div>
	);
}
