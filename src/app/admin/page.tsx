"use server";

import { H2, H3 } from "~/components/ui/typography";
import { getDistinctMembersCount, getTeamCount } from "~/services";
import AdminPageWrapper from "./_components/wrapper/admin-page";
import PageHeader from "./_components/wrapper/header";
import ShowSidebarTrigger from "./_components/wrapper/sidebar-trigger";

export default async function AdminPage() {
	const [teamCount, membershipsCount] = await Promise.all([
		getTeamCount(),
		getDistinctMembersCount(),
	]);

	return (
		<AdminPageWrapper>
			<div className="flex items-center space-x-1">
				<ShowSidebarTrigger />
				<PageHeader>Oversikt</PageHeader>
			</div>

			<div className="grid gap-6 md:grid-cols-2">
				<div className="space-y-6 rounded-lg border bg-card p-4 shadow">
					<H2>Antall lag</H2>
					<H3>{teamCount}</H3>
				</div>

				<div className="space-y-6 rounded-lg border bg-card p-4 shadow">
					<H2>Antall unike medlemmer</H2>
					<H3>{membershipsCount}</H3>
				</div>
			</div>
		</AdminPageWrapper>
	);
}
