"use client";

import { LayoutGrid, type LucideIcon, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "~/components/ui/sidebar";

type SidebarItem = {
	title: string;
	url: string;
	icon: LucideIcon;
};

const applicationItems: SidebarItem[] = [
	{
		title: "Oversikt",
		url: "/admin",
		icon: LayoutGrid,
	},
	{
		title: "Brukere",
		url: "/admin/brukere",
		icon: Users,
	},
	{
		title: "Lag",
		url: "/admin/lag",
		icon: Trophy,
	},
];

export default function MainSidebarGroup() {
	const { setOpenMobile, isMobile } = useSidebar();
	const pathname = usePathname();

	const handleSidebar = () => {
		isMobile && setOpenMobile(false);
	};

	const isActive = (item: SidebarItem) => {
		if (item.url === "/admin") {
			return pathname === item.url;
		}

		return pathname.startsWith(item.url);
	};

	return (
		<SidebarGroup>
			<SidebarGroupContent>
				<SidebarMenu className="space-y-2">
					{applicationItems.map((item: SidebarItem) => (
						<SidebarMenuItem key={item.title}>
							<SidebarMenuButton asChild isActive={isActive(item)} size="lg">
								<Link onClick={handleSidebar} href={item.url}>
									<item.icon className="h-4 w-4" />
									<span>{item.title}</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
