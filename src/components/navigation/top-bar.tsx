"use client";

import clsx from "clsx";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import TihldeLogo from "../logo";
import { Button } from "../ui/button";

interface NavbarProps {
  isLoggedIn: boolean;
}

const navigationItems = [
  { id: "home", text: "Hjem", to: "/" },
  { id: "teams", text: "Mine lag", to: "/min-oversikt", auth: true },
];

const Navbar = ({ isLoggedIn }: NavbarProps) => {
  const [isOnTop, setIsOnTop] = useState(true);
  const { setTheme, theme } = useTheme();
  const pathname = usePathname();

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
        isOnTop ? "bg-transparent" : "bg-background/95 dark:bg-background/60"
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
            if (item.auth && !isLoggedIn) return null;

            return (
              <Link
                key={item.id}
                href={item.to}
                className={clsx(
                  "font-medium text-foreground-secondary text-sm transition-colors hover:text-foreground-primary",
                  pathname === item.to
                    ? "font-bold text-foreground-primary"
                    : ""
                )}
              >
                {item.text}
              </Link>
            );
          })}
        </div>
        <div className="flex w-full items-center justify-end gap-x-4">
          {!isLoggedIn && (
            <Button variant="outline" asChild>
              <Link href="/auth/logg-inn">Logg inn</Link>
            </Button>
          )}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={toggleDarkMode}
              aria-label="Toggle dark mode"
            >
              {theme === "dark" ? (
                <SunIcon className="h-6 w-6 cursor-pointer text-textSecondary" />
              ) : (
                <MoonIcon className="h-6 w-6 cursor-pointer text-textSecondary" />
              )}
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
