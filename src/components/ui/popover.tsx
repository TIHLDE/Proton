"use client";

import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import * as React from "react";

import { cn } from "~/lib/utils";

function Popover({ ...props }: PopoverPrimitive.Root.Props) {
	return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({ ...props }: PopoverPrimitive.Trigger.Props) {
	return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverContent({
	className,
	align = "center",
	alignOffset = 0,
	side = "bottom",
	sideOffset = 4,
	anchor,
	...props
}: PopoverPrimitive.Popup.Props &
	Pick<
		PopoverPrimitive.Positioner.Props,
		"align" | "alignOffset" | "side" | "sideOffset" | "anchor"
	>) {
	// Avvik fra Photon nr. 2: `anchor` slippes gjennom til Positioner. Uten den
	// må alt som skal posisjonere en popover gå via <PopoverTrigger>, og det
	// tvinger fram en trigger selv der elementet ikke er en knapp — se
	// time-picker.tsx, der feltet er ankeret og klokkeknappen er triggeren.
	//
	// Avvik fra Photon nr. 1: portalen får et mål. En modal dialog stenger alt
	// utenfor seg selv ute — pointer-events på <body>, aria-hidden på søsknene
	// — så en popover portalert til <body> blir synlig, men helt uklikkbar.
	// Markøren under står der popoveren er brukt, så vi finner dialogen rundt
	// og portalerer dit. Utenfor en dialog blir container null, og Base UI
	// faller tilbake til body.
	//
	// Målet er *portalen*, ikke innholdet. dialog-content har både en
	// `translate`-transform og `overflow-y-auto`: en popover der inne blir
	// posisjonert mot dialogen og klippet av scroll-boksen hennes, så
	// kalenderen la seg oppå tittelen med toppen avkuttet i stedet for å legge
	// seg under feltet. dialog-portal er samme modale scope, men uten
	// transform og uten overflow. Faller tilbake på innholdet for dialoger som
	// ikke skulle ha noen portal-node.
	const [container, setContainer] = React.useState<HTMLElement | null>(null);
	const markerRef = React.useCallback((node: HTMLSpanElement | null) => {
		setContainer(
			node?.closest<HTMLElement>('[data-slot="dialog-portal"]') ??
				node?.closest<HTMLElement>('[data-slot="dialog-content"]') ??
				null,
		);
	}, []);

	return (
		<>
			<span ref={markerRef} hidden />
			<PopoverPrimitive.Portal container={container ?? undefined}>
				<PopoverPrimitive.Positioner
					align={align}
					alignOffset={alignOffset}
					side={side}
					sideOffset={sideOffset}
					anchor={anchor}
					className="isolate z-50"
				>
					<PopoverPrimitive.Popup
						data-slot="popover-content"
						className={cn(
							"data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:fade-in-0 data-open:zoom-in-95 data-closed:fade-out-0 data-closed:zoom-out-95 z-50 flex w-72 origin-(--transform-origin) flex-col gap-2.5 rounded-lg bg-popover p-2.5 text-popover-foreground text-sm shadow-md outline-hidden ring-1 ring-foreground/10 duration-100 data-closed:animate-out data-open:animate-in",
							className,
						)}
						{...props}
					/>
				</PopoverPrimitive.Positioner>
			</PopoverPrimitive.Portal>
		</>
	);
}

function PopoverHeader({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="popover-header"
			className={cn("flex flex-col gap-0.5 text-sm", className)}
			{...props}
		/>
	);
}

function PopoverTitle({ className, ...props }: PopoverPrimitive.Title.Props) {
	return (
		<PopoverPrimitive.Title
			data-slot="popover-title"
			className={cn("font-medium", className)}
			{...props}
		/>
	);
}

function PopoverDescription({
	className,
	...props
}: PopoverPrimitive.Description.Props) {
	return (
		<PopoverPrimitive.Description
			data-slot="popover-description"
			className={cn("text-muted-foreground", className)}
			{...props}
		/>
	);
}

export {
	Popover,
	PopoverContent,
	PopoverDescription,
	PopoverHeader,
	PopoverTitle,
	PopoverTrigger,
};
