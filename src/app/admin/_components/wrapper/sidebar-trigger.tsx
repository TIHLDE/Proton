"use client";

import { SidebarTrigger, useSidebar } from "~/components/ui/sidebar";
import { cn } from "~/lib/utils";

interface ShowSidebarTriggerProps {
	className?: string;
}

export default function ShowSidebarTrigger({
	className,
}: ShowSidebarTriggerProps) {
	const { state } = useSidebar();

	return (
		<div className={cn(state === "expanded" && "md:hidden", className)}>
			<SidebarTrigger />
		</div>
	);
}
