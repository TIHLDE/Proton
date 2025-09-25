"use client";

import clsx from "clsx";
import { HomeIcon, Loader2, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { authClient } from "~/lib/auth-client";

const navigationItems = [
	{ id: "home", text: "Hjem", to: "/", icon: <HomeIcon className="h-5 w-5" /> },
	{
		id: "all-teams",
		text: "Lag",
		icon: <Trophy className="h-5 w-5" />,
		to: "/lag",
	},
	{
		id: "my-teams",
		text: "Mine lag",
		icon: <Users className="h-5 w-5" />,
		to: "/min-oversikt",
		auth: true,
	},
];

const BottomBar: React.FC = () => {
	const pathname = usePathname();

	const { data: session, isPending } = authClient.useSession();

	return (
		<div className="fixed right-0 bottom-0 left-0 z-30 w-full bg-background/95 backdrop-blur-md sm:hidden">
			<div className="flex items-center justify-center gap-x-12 px-8 py-2">
				{navigationItems.map((navigationItem) => {
					if (isPending && navigationItem.auth) {
						return (
							<div
								key={navigationItem.id}
								className="flex flex-col items-center"
							>
								<Loader2 className="h-5 w-5 animate-spin" />
							</div>
						);
					}

					if (navigationItem.auth && !session?.user) return null;

					return (
						<Link
							key={navigationItem.id}
							href={navigationItem.to}
							className={clsx(
								"flex flex-col items-center font-medium text-xs transition-colors",
								pathname === navigationItem.to
									? "font-bold text-foreground-primary"
									: "",
							)}
						>
							{navigationItem.icon}
							<span>{navigationItem.text}</span>
						</Link>
					);
				})}
			</div>
		</div>
	);
};

export default BottomBar;
