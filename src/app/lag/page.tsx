"use server";

import { PackageOpen } from "lucide-react";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { H1, H2, P } from "~/components/ui/typography";
import { auth } from "~/lib/auth";
import { getAllTeams } from "~/services";
import CreateTeam from "./_components/create";
import EditTeam from "./_components/edit";

export default async function TeamsOverviewPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session || !session.user.isAdmin) notFound();

	const teams = await getAllTeams();

	return (
		<div className="mx-auto min-h-screen w-full max-w-7xl space-y-12 px-2 py-24 md:space-y-20 md:py-32 lg:px-12">
			<div className="space-y-4 md:flex md:items-center md:justify-between md:space-y-0">
				<div>
					<H1>Idrettslag</H1>
					<P>Her kan du se en oversikt over alle idrettslagene til TIHLDE</P>
				</div>

				<CreateTeam />
			</div>

			{teams.length === 0 && (
				<div className="mx-auto w-full space-y-12 rounded-lg border bg-card p-20 shadow">
					<PackageOpen className="mx-auto h-16 w-16 stroke-[1px] text-muted-foreground" />
					<div className="space-y-2 text-center">
						<H2>Ingen lag funnet</H2>
						<P>
							Det finnes ingen idrettslag registrert. Trykk på knappen under for
							å opprette et nytt lag.
						</P>
					</div>

					<div className="flex justify-center">
						<CreateTeam />
					</div>
				</div>
			)}

			{teams.length > 0 && (
				<div className="grid w-full gap-6 md:grid-cols-2 lg:grid-cols-3">
					{teams.map((team) => (
						<div
							key={team.id}
							className="space-y-4 rounded-lg border bg-card p-6 shadow transition-shadow hover:shadow-md"
						>
							<div className="flex items-center justify-between">
								<H2>{team.name}</H2>
								<EditTeam team={team} />
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
