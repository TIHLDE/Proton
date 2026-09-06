import { NextResponse } from "next/server";

// Uten denne prerendres ruta ved bygging, og oppetiden fryses til byggetidspunktet.
export const dynamic = "force-dynamic";

export function GET() {
	// process.uptime(), ikke en modulvariabel: Next laster modulen ved første
	// forespørsel, ikke ved oppstart, så en `new Date()` her ville datert seg
	// selv i stedet for containeren.
	const uptimeSeconds = Math.round(process.uptime());

	return NextResponse.json({
		version: process.env.APP_VERSION || "unknown",
		commit: process.env.GIT_SHA || "unknown",
		startedAt: new Date(Date.now() - uptimeSeconds * 1000).toISOString(),
		uptimeSeconds,
	});
}
