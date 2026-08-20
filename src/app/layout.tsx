import "~/styles/globals.css";

import type { Metadata } from "next";

import { Inter } from "next/font/google";
import { ServiceWorkerRegistration } from "~/components/service-worker-registration";
import Providers from "./_components/providers";

export const metadata: Metadata = {
	title: "Idrett | TIHLDE",
	description: "Idrettsplattformen til TIHLDE - bli med på lag og aktiviteter",
};

// Variabel-akse (ingen `weight`), samme typesnitt som @tihlde/ui laster via
// @fontsource-variable/inter. Eksponeres som --font-inter og plukkes opp av
// --font-sans i globals.css.
const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
	display: "swap",
});

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		// Font-variabelen må ligge på <html>: globals.css setter `font-sans` der,
		// og en variabel definert på <body> er ikke synlig for forelderen.
		<html lang="no-NO" className={inter.variable} suppressHydrationWarning>
			<body className="antialiased">
				<Providers>
					<ServiceWorkerRegistration />
					<div className="relative min-h-dvh">
						<main className="w-full">{children}</main>
					</div>
				</Providers>
			</body>
		</html>
	);
}
