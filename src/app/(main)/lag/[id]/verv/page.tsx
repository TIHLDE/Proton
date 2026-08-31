"use server";

import type { User } from "@prisma/client";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { ArrowLeft, PackageOpen } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "~/components/ui/button";
import { H1, H2, H3, P } from "~/components/ui/typography";
import { auth } from "~/lib/auth";
import {
	getLeadershipPeriods,
	getTeam,
	getTeamMembersForSelection,
	getTeamMembershipRoles,
	getTeamPositions,
	hasTeamAccess,
} from "~/services";
import ManagePositions from "./_components/manage-positions";
import PeriodAdmin from "./_components/period-admin";
import PeriodDialog from "./_components/period-dialog";
import RemoveAssignment from "./_components/remove-assignment";

interface TeamVervPageProps {
	params: Promise<{ id: string }>;
}

export default async function TeamVervPage({ params }: TeamVervPageProps) {
	const { id } = await params;

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

	const [periods, positions, members] = await Promise.all([
		getLeadershipPeriods(id),
		getTeamPositions(id),
		isAdmin ? getTeamMembersForSelection(id) : Promise.resolve([]),
	]);

	return (
		<div className="mx-auto min-h-screen w-full max-w-7xl space-y-12 px-2 py-24 md:space-y-20 md:py-32 lg:px-12">
			<div className="space-y-4 md:flex md:items-center md:justify-between md:space-y-0">
				<div className="space-y-4">
					<Button
						variant="ghost"
						size="sm"
						render={
							<Link href={`/lag/${id}`}>
								<ArrowLeft />
								Tilbake til {team.name}
							</Link>
						}
					/>
					<H1>Vervhistorikk</H1>
					<P>Hvem som har hatt hvilket verv, nå og tidligere.</P>
				</div>

				{isAdmin && (
					<div className="flex gap-2">
						<ManagePositions teamId={id} positions={positions} />
						<PeriodDialog teamId={id} />
					</div>
				)}
			</div>

			{periods.length === 0 && (
				<div className="mx-auto w-full space-y-12 rounded-lg border bg-card p-20 shadow">
					<PackageOpen className="mx-auto h-16 w-16 stroke-[1px] text-muted-foreground" />
					<div className="space-y-2 text-center">
						<H2>Ingen perioder</H2>
						<P>
							{isAdmin
								? "Opprett vervene laget har, og legg så inn en periode."
								: "Laget har ikke lagt inn vervhistorikk ennå."}
						</P>
					</div>
				</div>
			)}

			<div className="space-y-6">
				{periods.map((period) => {
					const usedPositionIds = new Set(
						period.assignments.map((assignment) => assignment.positionId),
					);
					const missingPositions = positions.filter(
						(position) => !usedPositionIds.has(position.id),
					);

					return (
						<div
							key={period.id}
							className="space-y-4 rounded-lg border bg-card p-6 shadow-sm"
						>
							<div className="flex flex-wrap items-start justify-between gap-2">
								<div>
									<H3>
										{period.name ??
											`Styret ${format(period.startDate, "yyyy", { locale: nb })}`}
									</H3>
									<P className="text-muted-foreground text-sm">
										{format(period.startDate, "MMMM yyyy", { locale: nb })} –{" "}
										{format(period.endDate, "MMMM yyyy", { locale: nb })}
										{period.isOldest && " · det første"}
									</P>
								</div>
								{isAdmin && <PeriodDialog teamId={id} period={period} />}
							</div>

							{period.assignments.length === 0 && (
								<P className="text-muted-foreground text-sm">
									Ingen verv er tildelt i denne perioden.
								</P>
							)}

							<ul className="space-y-1">
								{period.assignments.map((assignment) => (
									<li
										key={assignment.id}
										className="flex items-center justify-between gap-2 rounded-md px-2 py-1 text-sm hover:bg-accent"
									>
										<span>
											<span className="text-muted-foreground">
												{assignment.positionName}:
											</span>{" "}
											<span className="font-medium">
												{assignment.user.name}
											</span>
											{assignment.reElected && (
												<span className="text-muted-foreground">
													{" "}
													(gjenvalgt)
												</span>
											)}
										</span>
										{isAdmin && (
											<RemoveAssignment
												assignmentId={assignment.id}
												label={`${assignment.positionName} for ${assignment.user.name}`}
											/>
										)}
									</li>
								))}
							</ul>

							{isAdmin && (
								<PeriodAdmin
									periodId={period.id}
									periodLabel={
										period.name ??
										`styret ${format(period.startDate, "yyyy", { locale: nb })}`
									}
									assignmentCount={period.assignments.length}
									positions={positions}
									members={members}
									missingPositions={missingPositions}
								/>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}
