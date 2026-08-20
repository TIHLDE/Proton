"use client";

import { Slot } from "@radix-ui/react-slot";
import type * as React from "react";

import { cn } from "~/lib/utils";

/**
 * Inngangsanimasjon for innhold som monteres.
 *
 * Begge komponentene er markup-frie når du gir dem `asChild`: de rendrer *som*
 * elementet du legger inni, så å pakke en eksisterende `<ul className="grid …">`
 * endrer ingen layout og legger ingen ekstra node. Selve animasjonen bor i
 * `src/styles/globals.css` ved siden av easing-tokenene, styrt av `data-slot`
 * disse setter — det holder timingen ett sted.
 *
 * De kjøres på nytt hver gang elementet monteres, som er det som gjør at de
 * virker sammen med Suspense og klient-navigering: en seksjon som strømmer inn
 * sent animerer når dataene lander, ikke når dokumentet først ble parset.
 */

type MotionProps = React.ComponentProps<"div"> & {
	asChild?: boolean;
};

/**
 * Toner ett element opp ved montering.
 *
 * ```tsx
 * <Reveal asChild>
 *   <section className="flex flex-col gap-4">…</section>
 * </Reveal>
 * ```
 *
 * Juster per bruk med `--reveal-duration` / `--reveal-distance`.
 */
function Reveal({ className, asChild = false, ...props }: MotionProps) {
	const Comp = asChild ? Slot : "div";

	return <Comp data-slot="reveal" className={cn(className)} {...props} />;
}

/**
 * Toner elementets direkte barn opp ved montering, hvert et hakk etter det
 * forrige. Bruk den på selve lista eller rutenettet, så barna den staggerer er
 * kortene:
 *
 * ```tsx
 * <Stagger asChild>
 *   <ul className="grid gap-4 sm:grid-cols-2">…</ul>
 * </Stagger>
 * ```
 *
 * Steget er 40 ms, med tak på 5 barn; `--reveal-step` overstyrer det.
 */
function Stagger({ className, asChild = false, ...props }: MotionProps) {
	const Comp = asChild ? Slot : "div";

	return <Comp data-slot="stagger" className={cn(className)} {...props} />;
}

export { Reveal, Stagger };
