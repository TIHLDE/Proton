"use client";

import * as SeparatorPrimitive from "@radix-ui/react-separator";
import type * as React from "react";

import { cn } from "~/lib/utils";

type SeparatorProps = React.ComponentProps<typeof SeparatorPrimitive.Root> & {
	/**
	 * `subtle` demper linjen slik at den skiller seksjoner uten å trekke blikket.
	 */
	variant?: "default" | "subtle";
};

function Separator({
	className,
	orientation = "horizontal",
	decorative = true,
	variant = "default",
	...props
}: SeparatorProps) {
	return (
		<SeparatorPrimitive.Root
			data-slot="separator"
			decorative={decorative}
			orientation={orientation}
			className={cn(
				"shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-px data-[orientation=vertical]:self-stretch",
				variant === "subtle" && "bg-border-subtle",
				className,
			)}
			{...props}
		/>
	);
}

export { Separator };
