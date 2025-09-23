"use server";

import type { User } from "@prisma/client";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Navigation from "~/components/navigation/navigation";
import SearchInput from "~/components/navigation/search-input";
import { H1, H3, P } from "~/components/ui/typography";
import { auth } from "~/lib/auth";
import {
	getTeam,
	getTeamMemberships,
	getTeamMembershipsCount,
	hasTeamAccess,
} from "~/services";

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

	return (
		<div className="mx-auto min-h-screen w-full max-w-7xl space-y-20 px-2 py-32 lg:px-12">
			<div className="flex items-center justify-between">
				<div>
					<H1>{team.name}</H1>
					<P>Medlemmer ({membersCount})</P>
				</div>
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
							<P>{membership.role === "ADMIN" ? "Administrator" : "Medlem"}</P>
						</div>
					))}
				</div>

				<div className="md:flex md:justify-end">
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
