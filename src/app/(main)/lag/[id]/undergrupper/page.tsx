"use server";

import type { User } from "@prisma/client";
import { ArrowLeft, PackageOpen } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "~/components/ui/button";
import { H1, H2, H3, P } from "~/components/ui/typography";
import { auth } from "~/lib/auth";
import {
	getTeam,
	getTeamGroups,
	getTeamMembersForSelection,
	getTeamMembershipRoles,
	hasTeamAccess,
} from "~/services";
import CreateGroup from "./_components/create-group";
import DeleteGroup from "./_components/delete-group";
import EditGroup from "./_components/edit-group";
import ManageMembers from "./_components/manage-members";

interface TeamGroupsPageProps {
	params: Promise<{ id: string }>;
}

export default async function TeamGroupsPage({ params }: TeamGroupsPageProps) {
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

	const groups = await getTeamGroups(id);
	const teamMembers = isAdmin ? await getTeamMembersForSelection(id) : [];

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
					<H1>Undergrupper</H1>
					<P>
						Lagets egne inndelinger. Et arrangement kan åpnes for én eller flere
						av dem.
					</P>
				</div>

				{isAdmin && <CreateGroup teamId={id} />}
			</div>

			{groups.length === 0 && (
				<div className="mx-auto w-full space-y-12 rounded-lg border bg-card p-20 shadow">
					<PackageOpen className="mx-auto h-16 w-16 stroke-[1px] text-muted-foreground" />
					<div className="space-y-2 text-center">
						<H2>Ingen undergrupper</H2>
						<P>
							{isAdmin
								? "Lag en undergruppe for å dele laget inn i tropper."
								: "Laget har ingen undergrupper ennå."}
						</P>
					</div>
				</div>
			)}

			{groups.length > 0 && (
				<div className="grid w-full gap-6 md:grid-cols-2 lg:grid-cols-3">
					{groups.map((group) => (
						<div
							key={group.id}
							className="flex flex-col gap-4 rounded-lg border bg-card p-4 shadow-sm"
						>
							<div className="space-y-1">
								<H3>{group.name}</H3>
								<P className="text-muted-foreground text-sm">
									{group.members.length}{" "}
									{group.members.length === 1 ? "medlem" : "medlemmer"}
								</P>
								{group.description && <P>{group.description}</P>}
							</div>

							<ul className="flex-1 space-y-1 text-sm">
								{group.members.map((member) => (
									<li key={member.id}>{member.user.name}</li>
								))}
								{group.members.length === 0 && (
									<li className="text-muted-foreground">Ingen medlemmer</li>
								)}
							</ul>

							{isAdmin && (
								<div className="flex flex-wrap gap-1 border-t pt-2">
									<ManageMembers
										groupId={group.id}
										groupName={group.name}
										teamMembers={teamMembers}
										memberIds={group.members.map((member) => member.userId)}
									/>
									<EditGroup
										groupId={group.id}
										name={group.name}
										description={group.description}
									/>
									<DeleteGroup
										groupId={group.id}
										name={group.name}
										opensUpIfDeleted={group.opensUpIfDeleted}
									/>
								</div>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	);
}
