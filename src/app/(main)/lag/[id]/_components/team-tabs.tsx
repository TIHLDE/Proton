"use client";

import {
	BarChart3,
	CalendarDays,
	Layers,
	ScrollText,
	UsersRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ScrollFade } from "~/components/ui/scroll-fade";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";

type TeamTabsProps = {
	teamId: string;
	/** Administrer-fanen vises bare for lagets ledelse og globale admins. */
	showAdmin: boolean;
};

export function TeamTabs({ teamId, showAdmin }: TeamTabsProps) {
	const pathname = usePathname();
	const base = `/lag/${teamId}`;

	const tabs = [
		...(showAdmin
			? [
					{
						href: `${base}/admin`,
						label: "Administrer arrangementer",
						icon: <CalendarDays />,
					},
				]
			: []),
		{ href: base, label: "Arrangementer", icon: <CalendarDays /> },
		{ href: `${base}/medlemmer`, label: "Medlemmer", icon: <UsersRound /> },
		{ href: `${base}/undergrupper`, label: "Undergrupper", icon: <Layers /> },
		{ href: `${base}/verv`, label: "Verv", icon: <ScrollText /> },
		{ href: `${base}/statistikk`, label: "Statistikk", icon: <BarChart3 /> },
	];

	// Lagsiden ligger på prefikset til alle underrutene, så en ren
	// startsWith ville markert den som aktiv overalt. Lengste treff vinner.
	const active =
		tabs
			.filter((tab) => pathname === tab.href)
			.map((tab) => tab.href)
			.at(0) ?? base;

	return (
		// Fem faner er bredere enn en mobilskjerm. ScrollFade toner ut i den
		// kanten det finnes mer å scrolle til, slik som i Photon.
		<ScrollFade render={<nav />}>
			<Tabs value={active}>
				<TabsList>
					{tabs.map((tab) => (
						<TabsTrigger
							key={tab.href}
							value={tab.href}
							className="px-3"
							// Fanene navigerer mellom ruter, så de rendres som
							// lenker. Da må Base UI slutte å forvente en <button>.
							nativeButton={false}
							render={<Link href={tab.href} />}
						>
							{tab.icon}
							{tab.label}
						</TabsTrigger>
					))}
				</TabsList>
			</Tabs>
		</ScrollFade>
	);
}
