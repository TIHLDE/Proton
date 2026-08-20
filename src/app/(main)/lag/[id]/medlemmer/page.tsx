"use server";

import type { User } from "@prisma/client";
import { Edit } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navigation from "~/components/navigation/navigation";
import SearchInput from "~/components/navigation/search-input";
import { Button } from "~/components/ui/button";
import { H2, H3, P } from "~/components/ui/typography";
import { auth } from "~/lib/auth";
import {
	getTeam,
	getTeamMembershipRoles,
	getTeamMemberships,
	getTeamMembershipsCount,
	hasTeamAccess,
} from "~/services";
import EditRole from "./_components/edit-role";
import Role from "./_components/role";

interface TeamMembersPageProps {
	params: Promise<{ id: string }>;
	searchParams: Promise<{ search?: string; page?: string }>;
}

export default async function TeamMembersPage({
	params,
	searchParams,
}: TeamMembersPageProps) {
	const { id } = await params;
	const { search, page } = await searchParams;

	const currentPage = page ? Number.parseInt(page) : 1;

	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) notFound();

	const membership = await hasTeamAccess(id, session.user as User);

	if (!membership) notFound();

	const team = await getTeam(id);

	if (!team) notFound();

	const membershipsData = await getTeamMemberships(id, currentPage, search);
	const membersCount = await getTeamMembershipsCount(id);
	const roles = await getTeamMembershipRoles(session.user.id, id);

	return (
		<div className="space-y-12 md:space-y-20">
			<div>
				<H2>Medlemmer</H2>
				<P>{membersCount} i laget</P>
			</div>

			<div className="space-y-6">
				<SearchInput />

				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
					{membershipsData.memberships.map((membership) => (
						<div
							key={membership.id}
							className="rounded-lg border bg-card p-4 shadow-sm"
						>
							<H3>{membership.user.name}</H3>
							<P>
								<Role role={membership.role} />
							</P>
							{(roles.includes("ADMIN") || session.user.isAdmin) && (
								<EditRole
									membershipId={membership.id}
									teamId={id}
									role={membership.role}
								/>
							)}
						</div>
					))}
				</div>

				<div className="flex justify-center md:justify-end">
					<Navigation
						page={currentPage}
						nextPage={currentPage + 1}
						totalPages={Math.ceil(membersCount / 10)}
					/>
				</div>
			</div>
		</div>
	);
}
