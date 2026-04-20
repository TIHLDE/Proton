import type { Metadata } from "next";
import { Suspense } from "react";

import BottomBar from "~/components/navigation/bottom-bar";
import Footer from "~/components/navigation/footer";
import Navbar from "~/components/navigation/top-bar";
import { RsvpToast } from "./_components/rsvp-toast";

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
			<Suspense>
				<RsvpToast />
			</Suspense>
			<Navbar />
			<main className="w-full">{children}</main>
			<BottomBar />
			<Footer />
		</div>
	);
}
