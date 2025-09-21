"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { TRPCReactProvider } from "~/trpc/react";

export default function Providers({ children }: { children: ReactNode }) {
	return (
		<TRPCReactProvider>
			<NextThemesProvider
				attribute="class"
				defaultTheme="dark"
				enableSystem
				disableTransitionOnChange
			>
				{children}
				<Toaster />
			</NextThemesProvider>
		</TRPCReactProvider>
	);
}
