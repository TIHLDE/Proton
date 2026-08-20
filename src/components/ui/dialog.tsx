"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import type * as React from "react";

import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

function Dialog({
	...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
	return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({
	...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
	return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({
	...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
	return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({
	...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
	return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
	className,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
	return (
		<DialogPrimitive.Overlay
			data-slot="dialog-overlay"
			className={cn(
				"data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 isolate z-50 bg-black/10 duration-100 data-[state=closed]:animate-out data-[state=open]:animate-in supports-backdrop-filter:backdrop-blur-xs",
				className,
			)}
			{...props}
		/>
	);
}

function DialogContent({
	className,
	children,
	showCloseButton = true,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
	showCloseButton?: boolean;
}) {
	return (
		<DialogPortal data-slot="dialog-portal">
			<DialogOverlay />
			<DialogPrimitive.Content
				data-slot="dialog-content"
				className={cn(
					// max-h + overflow: uten dem vokser dialogen symmetrisk ut
					// over begge skjermkanter når innholdet er høyere enn
					// viewporten — tittel og lukkeknapp havner over toppen,
					// handlingsknappene under bunnen, og siden den er `fixed`
					// kan ingen av dem nås. overscroll-contain hindrer at siden
					// bak tar over scrollingen når dialogen når enden.
					//
					// flex-col (ikke grid): lar `DialogBody` ta resthøyden og
					// scrolle for seg selv, slik at header og footer står låst.
					"data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 -translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100dvh-2rem)] w-full max-w-[calc(100%-2rem)] flex-col gap-4 overflow-y-auto overscroll-contain rounded-xl bg-popover p-4 text-popover-foreground text-sm outline-none ring-1 ring-foreground/10 duration-100 has-data-[slot=dialog-body]:overflow-hidden data-[state=closed]:animate-out data-[state=open]:animate-in sm:max-w-sm",
					className,
				)}
				{...props}
			>
				{children}
				{showCloseButton && (
					<DialogPrimitive.Close data-slot="dialog-close" asChild>
						<Button
							variant="ghost"
							size="icon-sm"
							className="absolute top-2 right-2"
						>
							<XIcon />
							<span className="sr-only">Lukk</span>
						</Button>
					</DialogPrimitive.Close>
				)}
			</DialogPrimitive.Content>
		</DialogPortal>
	);
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="dialog-header"
			className={cn("flex shrink-0 flex-col gap-2", className)}
			{...props}
		/>
	);
}

/**
 * Valgfri scrollcontainer for innholdet mellom `DialogHeader` og
 * `DialogFooter`. Uten den scroller hele dialogen, og tittel, lukkeknapp og
 * handlingsknapper forsvinner ut av synet hver sin vei. Med den låses header og
 * footer, og bare innholdet mellom dem scroller.
 *
 * Bruk den når innholdet kan bli høyere enn skjermen (skjemaer, lister).
 * Korte dialoger trenger den ikke.
 *
 * `min-h-0` er ikke valgfri: uten den lar ikke flex-elementet seg krympe under
 * innholdshøyden, og scrollingen havner på dialogen igjen. `relative` er heller
 * ikke valgfri: uten den er dialogen (som er `fixed`) containing block for
 * absolutt posisjonerte etterkommere, så de slipper unna klippingen her og gir
 * dialogen sin egen scrollhøyde igjen.
 */
function DialogBody({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="dialog-body"
			className={cn(
				"-mx-4 relative flex min-h-0 flex-auto flex-col gap-4 overflow-y-auto overscroll-contain px-4",
				className,
			)}
			{...props}
		/>
	);
}

function DialogFooter({
	className,
	showCloseButton = false,
	children,
	...props
}: React.ComponentProps<"div"> & {
	showCloseButton?: boolean;
}) {
	return (
		<div
			data-slot="dialog-footer"
			className={cn(
				"-mx-4 -mb-4 flex shrink-0 flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row sm:justify-end",
				className,
			)}
			{...props}
		>
			{children}
			{showCloseButton && (
				<DialogPrimitive.Close asChild>
					<Button variant="outline">Lukk</Button>
				</DialogPrimitive.Close>
			)}
		</div>
	);
}

function DialogTitle({
	className,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
	return (
		<DialogPrimitive.Title
			data-slot="dialog-title"
			className={cn(
				// wrap-anywhere, ikke break-words: den påvirker også
				// min-content-bredden, så et langt ord uten mellomrom ikke
				// presser hele dialogen bredere enn skjermen.
				"wrap-anywhere font-heading font-medium text-base leading-none",
				className,
			)}
			{...props}
		/>
	);
}

function DialogDescription({
	className,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
	return (
		<DialogPrimitive.Description
			data-slot="dialog-description"
			className={cn(
				"wrap-anywhere text-muted-foreground text-sm *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
				className,
			)}
			{...props}
		/>
	);
}

export {
	Dialog,
	DialogBody,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogOverlay,
	DialogPortal,
	DialogTitle,
	DialogTrigger,
};
