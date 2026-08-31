"use server";

import { ArrowRight, PackageOpen, TriangleAlert } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { H1, H2, P } from "~/components/ui/typography";
import { auth } from "~/lib/auth";
import { getMyTeamMemberships, syncTeamMembershipsIfStale } from "~/services";
import ReconnectButton from "./_components/reconnect";

export default async function MyOverviewPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) redirect("/");

	// Medlemskapene hentes fra Photon her, ikke bak en knapp. Kallet strupes
	// til ett per kvarter, så et sidebesøk vanligvis bare leser fra databasen.
	const syncResult = await syncTeamMembershipsIfStale(session.user.id);

	const memberships = await getMyTeamMemberships(session.user.id);

	return (
		<div className="mx-auto min-h-screen w-full max-w-7xl space-y-12 px-2 py-24 md:space-y-20 md:py-32 lg:px-12">
			<div className="space-y-4 md:flex md:items-center md:justify-between md:space-y-0">
				<div>
					<H1>Mine medlemskap</H1>
					<P>
						Her kan du se en oversikt over alle idrettslagene du er medlem av
					</P>
				</div>
			</div>

			{!syncResult.ok && (
				<div className="flex flex-col gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-start gap-3">
						<TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
						<P className="!mt-0">
							{syncResult.reason === "photon-error"
								? syncResult.status === 408
									? "TIHLDE svarte ikke i tide, så listen under kan være utdatert. Prøv igjen senere."
									: `Vi fikk ikke kontakt med TIHLDE (feil ${syncResult.status}), så listen under kan være utdatert. Prøv igjen senere.`
								: "Tilgangen til TIHLDE har utløpt, så listen under kan være utdatert."}
						</P>
					</div>

					{syncResult.reason !== "photon-error" && (
						<div className="shrink-0 pl-8 sm:pl-0">
							<ReconnectButton />
						</div>
					)}
				</div>
			)}

			{memberships.length === 0 && (
				<div className="mx-auto w-full space-y-12 rounded-lg border bg-card p-20 shadow">
					<PackageOpen className="mx-auto h-16 w-16 stroke-[1px] text-muted-foreground" />
					<div className="space-y-2 text-center">
						<H2>Ingen medlemskap funnet</H2>
						<P>Du er ikke medlem av noen idrettslag.</P>
					</div>
				</div>
			)}

			{memberships.length > 0 && (
				<div className="grid w-full gap-6 md:grid-cols-2 lg:grid-cols-3">
					{memberships.map((membership) => (
						<Link
							key={membership.id}
							className="rounded-lg border bg-card p-6 shadow"
							href={`/lag/${membership.team.id}`}
						>
							<H2>{membership.team.name}</H2>
							<P>{membership.role === "ADMIN" ? "Administrator" : "Medlem"}</P>

							<div className="flex items-center justify-end gap-x-2">
								<p>Se mer</p>
								<ArrowRight className="h-4 w-4" />
							</div>
						</Link>
					))}
				</div>
			)}
		</div>
	);
}
