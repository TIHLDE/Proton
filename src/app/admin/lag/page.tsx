"use server";

import { ArrowRight, PackageOpen } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { H2, H3, P } from "~/components/ui/typography";
import { getAllTeams } from "~/services";
import AdminPageWrapper from "../_components/wrapper/admin-page";
import PageHeader from "../_components/wrapper/header";
import ShowSidebarTrigger from "../_components/wrapper/sidebar-trigger";
import CreateTeam from "./_components/create";
import EditTeam from "./_components/edit";

export default async function TeamsOverviewPage() {
	const teams = await getAllTeams();

	return (
		<AdminPageWrapper>
			<div className="space-y-4 md:flex md:items-center md:justify-between md:space-y-0">
				<div className="flex items-center space-x-1">
					<ShowSidebarTrigger />
					<PageHeader>Idrettslag</PageHeader>
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
							className="space-y-6 rounded-lg border bg-card p-4 shadow transition-shadow hover:shadow-md"
						>
							<div className="flex items-center justify-between">
								<H3>{team.name}</H3>
								<EditTeam team={team} />
							</div>

							<div className="flex justify-end">
								<Button asChild variant="link">
									<Link href={`/lag/${team.id}`}>
										Gå til lag
										<ArrowRight className="size-4" />
									</Link>
								</Button>
							</div>
						</div>
					))}
				</div>
			)}
		</AdminPageWrapper>
	);
}
