"use server";

import { PackageOpen } from "lucide-react";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { H1, H2, P } from "~/components/ui/typography";
import { auth } from "~/lib/auth";
import { getAllEventsByTeamId } from "~/services";
import CreateEvent from "./_components/create";
import EditEvent from "./_components/edit";

interface EventPageProps {
	params: Promise<{ id: string }>;
}

const getEventTypeLabel = (type: string): string => {
	const typeMap: Record<string, string> = {
		TRAINING: "Trening",
		MATCH: "Kamp",
		SOCIAL: "Sosialt",
		OTHER: "Annet",
	};
	return typeMap[type] || type;
};

export default async function EventsAdminPage({ params }: EventPageProps) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session || !session.user.isAdmin) notFound();

	const { id } = await params;
	const events = await getAllEventsByTeamId(id);

	return (
		<div className="mx-auto min-h-screen w-full max-w-7xl space-y-20 px-2 py-32 lg:px-12">
			<div className="flex items-center justify-between">
				<div>
					<H1>Arrangementer</H1>
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
						<div
							key={event.id}
							className="space-y-4 rounded-lg border bg-card p-6 shadow transition-shadow hover:shadow-md"
						>
							<div className="flex items-center justify-between">
								<H2>{event.name}</H2>
								<EditEvent
									event={{
										...event,
										type: event.type as
											| "TRAINING"
											| "MATCH"
											| "SOCIAL"
											| "OTHER",
									}}
									teamId={id}
								/>
							</div>
							<div className="space-y-2 text-muted-foreground text-sm">
								<p>
									<strong>Type:</strong> {getEventTypeLabel(event.type)}
								</p>
								<p>
									<strong>Dato:</strong>{" "}
									{new Date(event.datetime).toLocaleString("nb-NO")}
								</p>
								<p>
									<strong>Sted:</strong> {event.location || "Ikke oppgitt"}
								</p>
								{event.note && (
									<p>
										<strong>Notat:</strong> {event.note}
									</p>
								)}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
