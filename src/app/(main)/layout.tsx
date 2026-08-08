import type { Metadata } from "next";

import BottomBar from "~/components/navigation/bottom-bar";
import Footer from "~/components/navigation/footer";
import Navbar from "~/components/navigation/top-bar";
import UnansweredEventsBanner from "~/components/navigation/unanswered-events-banner";

export const metadata: Metadata = {
	title: "Idrett | TIHLDE",
	description: "Idrettsplattformen til TIHLDE - bli med på lag og aktiviteter",
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className="relative min-h-dvh">
			<Navbar />
			<main className="w-full">{children}</main>
			<UnansweredEventsBanner />
			<BottomBar />
			<Footer />
		</div>
	);
}
