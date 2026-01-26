"use client";

import clsx from "clsx";
import { Loader2, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient } from "~/lib/auth-client";
import TihldeLogo from "../logo";
import { Button } from "../ui/button";
import LoginForm from "./sign-in";
import UnansweredEventsDropdown from "./unanswered-events-dropdown";
import UserAvatar from "./user-avatar";

const navigationItems = [
	{ id: "home", text: "Hjem", to: "/" },
	{ id: "teams", text: "Mine lag", to: "/min-oversikt", auth: "MEMBER" },
	{ id: "superadmin", text: "Admin", to: "/admin", auth: "SUPERADMIN" },
];

const Navbar = () => {
	const [isOnTop, setIsOnTop] = useState(true);
	const { setTheme, theme } = useTheme();
	const pathname = usePathname();

	const { data: session, isPending } = authClient.useSession();

	useEffect(() => {
		const handleScroll = () => setIsOnTop(window.scrollY < 20);
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	const toggleDarkMode = () => {
		setTheme(theme === "dark" ? "light" : "dark");
	};

	return (
		<header
			className={clsx(
				"fixed top-0 z-30 w-full backdrop-blur-md transition-all duration-150",
				isOnTop ? "bg-transparent" : "bg-background/95 dark:bg-background/60",
			)}
		>
			<nav className="flex w-full items-center justify-between px-2 py-3 md:px-8">
				<Link
					href="/"
					aria-label="Til forsiden"
					className="flex items-center gap-2 justify-self-start font-bold text-lg text-logo sm:text-2xl"
				>
					<TihldeLogo size="large" className="h-auto w-32 sm:w-44" />
				</Link>
				<div className="hidden gap-4 lg:flex lg:gap-x-6">
					{navigationItems.map((item) => {
						if (item.auth && !session?.user) return null;
						if (item.auth === "SUPERADMIN" && !session?.user.isAdmin)
							return null;

						return (
							<Link
								key={item.id}
								href={item.to}
								className={clsx(
									"font-medium text-foreground-secondary text-sm transition-colors hover:text-foreground-primary",
									pathname === item.to
										? "font-bold text-foreground-primary"
										: "",
								)}
							>
								{item.text}
							</Link>
						);
					})}
				</div>
				<div className="flex items-center justify-end gap-x-2">
					{isPending && <Loader2 className="h-4 w-4 animate-spin" />}
					{!session?.user && !isPending && <LoginForm />}
					{session?.user && <UserAvatar />}
					{session?.user && <UnansweredEventsDropdown />}
					<Button
						size="icon"
						variant="ghost"
						onClick={toggleDarkMode}
						className="h-8 w-8 sm:h-10 sm:w-10"
					>
						<Sun className="dark:-rotate-90 h-[1rem] w-[1rem] rotate-0 scale-100 transition-all sm:h-[1.2rem] sm:w-[1.2rem] dark:scale-0" />
						<Moon className="absolute h-[1rem] w-[1rem] rotate-90 scale-0 transition-all sm:h-[1.2rem] sm:w-[1.2rem] dark:rotate-0 dark:scale-100" />
						<span className="sr-only">Toggle theme</span>
					</Button>
				</div>
			</nav>
		</header>
	);
};

export default Navbar;
