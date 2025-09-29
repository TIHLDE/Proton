"use server";

import AdminPageWrapper from "./_components/wrapper/admin-page";
import PageHeader from "./_components/wrapper/header";
import ShowSidebarTrigger from "./_components/wrapper/sidebar-trigger";

export default async function AdminPage() {
	return (
		<AdminPageWrapper>
			<div className="flex items-center space-x-1">
				<ShowSidebarTrigger />
				<PageHeader>Oversikt</PageHeader>
			</div>
		</AdminPageWrapper>
	);
}
