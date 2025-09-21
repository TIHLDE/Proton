import "~/styles/globals.css";

import type { Metadata } from "next";

import { Inter } from "next/font/google";
import { headers } from "next/headers";
import BottomBar from "~/components/navigation/bottom-bar";
import Footer from "~/components/navigation/footer";
import Navbar from "~/components/navigation/top-bar";
import { auth } from "~/lib/auth";
import Providers from "./_components/providers";

export const metadata: Metadata = {
	title: "Idrett | TIHLDE",
	description: "Idrettsplattformen til TIHLDE",
};

const inter = Inter({
	subsets: ["latin"],
	weight: ["300", "400", "500", "600", "700", "800", "900"],
	variable: "--font-inter",
	display: "swap",
});

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	return (
		<html lang="no-NO">
			<body className={`antialiased ${inter.variable}`}>
				<Providers>
					<div className="relative min-h-dvh">
						<Navbar isLoggedIn={!!session} />
						<main className="w-full">{children}</main>
						<BottomBar />
						<Footer />
					</div>
				</Providers>
			</body>
		</html>
	);
}
