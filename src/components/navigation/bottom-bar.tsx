"use client";

import clsx from "clsx";
import { HomeIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationItems = [
	{ id: "home", text: "Hjem", to: "/", icon: <HomeIcon className="h-5 w-5" /> },
];

const BottomBar: React.FC = () => {
	const pathname = usePathname();

	return (
		<div className="fixed right-0 bottom-0 left-0 z-30 w-full bg-background/95 backdrop-blur-md sm:hidden">
			<div className="flex items-center justify-between px-8 py-2">
				{navigationItems.map((navigationItem) => (
					<Link
						key={navigationItem.id}
						href={navigationItem.to}
						className={clsx(
							"flex flex-col items-center font-medium text-xs transition-colors",
							pathname === navigationItem.to
								? "font-bold text-foreground-primary"
								: "text-foreground-secondary",
						)}
					>
						{navigationItem.icon}
						<span>{navigationItem.text}</span>
					</Link>
				))}
			</div>
		</div>
	);
};

export default BottomBar;
