import Link from "next/link";
import TihldeLogo from "~/components/logo";
import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarTrigger,
} from "~/components/ui/sidebar";
import MainSidebarGroup from "./main-group";

export default function AdminSidebar() {
	return (
		<Sidebar className="border-none bg-background">
			<SidebarHeader className="bg-background pt-4 pb-12">
				<div className="flex items-center justify-between">
					<Link href="/">
						<TihldeLogo size="large" className="h-auto w-32" />
					</Link>
					<SidebarTrigger />
				</div>
			</SidebarHeader>
			<SidebarContent className="bg-background">
				<MainSidebarGroup />
			</SidebarContent>
		</Sidebar>
	);
}
