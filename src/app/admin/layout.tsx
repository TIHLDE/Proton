import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { SidebarProvider } from "~/components/ui/sidebar";
import { auth } from "~/lib/auth";
import AdminSidebar from "./_components/sidebar";

interface AdminSidebarProps {
	children: React.ReactNode;
}

export default async function Layout({ children }: AdminSidebarProps) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session || !session.user.isAdmin) notFound();

	return (
		<SidebarProvider>
			<AdminSidebar />
			<main className="w-full bg-background md:pl-4">
				<div className="px-2 md:px-4">{children}</div>
			</main>
		</SidebarProvider>
	);
}
