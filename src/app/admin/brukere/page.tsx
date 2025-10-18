"use server";

import { getUsersCount, listUsers } from "~/services";
import AdminPageWrapper from "../_components/wrapper/admin-page";
import PageHeader from "../_components/wrapper/header";
import ShowSidebarTrigger from "../_components/wrapper/sidebar-trigger";
import UsersTable from "./_components/table";

interface AdminUsersPageProps {
	searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function AdminUsersPage({
	searchParams,
}: AdminUsersPageProps) {
	const { page, search } = await searchParams;

	const currentPage = page ? Number.parseInt(page) : 1;

	const [data, usersCount] = await Promise.all([
		listUsers(currentPage, search),
		getUsersCount(),
	]);

	const nextPage = data.users.length === 25 ? currentPage + 1 : null;

	return (
		<AdminPageWrapper>
			<div className="flex items-center space-x-1">
				<ShowSidebarTrigger />
				<PageHeader>Brukere</PageHeader>
			</div>

			<UsersTable
				users={data.users}
				page={currentPage}
				nextPage={nextPage}
				count={usersCount}
				totalPages={data.totalPages}
			/>
		</AdminPageWrapper>
	);
}
