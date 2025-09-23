"use client";

import clsx from "clsx";
import { Loader2, Moon, MoonIcon, Sun, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient } from "~/lib/auth-client";
import TihldeLogo from "../logo";
import { Button } from "../ui/button";
import UserAvatar from "./user-avatar";

const navigationItems = [
	{ id: "home", text: "Hjem", to: "/" },
	{ id: "teams", text: "Mine lag", to: "/min-oversikt", auth: true },
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
			<nav className="grid w-full grid-cols-3 items-center px-8 py-3">
				<Link
					href="/"
					aria-label="Til forsiden"
					className="flex items-center gap-2 justify-self-start font-bold text-2xl text-logo"
				>
					<TihldeLogo size="large" className="h-auto w-44" />
				</Link>
				<div className="hidden gap-6 justify-self-center sm:flex">
					{navigationItems.map((item) => {
						if (item.auth && !session?.user) return null;

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
				<div className="flex w-full items-center justify-end gap-x-2">
					{isPending && <Loader2 className="h-4 w-4 animate-spin" />}
					{!session?.user && !isPending && (
						<Button variant="outline" asChild>
							<Link href="/auth/logg-inn">Logg inn</Link>
						</Button>
					)}
					{session?.user && <UserAvatar />}
					<Button size="icon" onClick={toggleDarkMode}>
						<Sun className="dark:-rotate-90 h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:scale-0" />
						<Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
						<span className="sr-only">Toggle theme</span>
					</Button>
				</div>
			</nav>
		</header>
	);
};

export default Navbar;
