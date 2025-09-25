"use server";

import { ArrowRight, PackageOpen } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { H1, H2, P } from "~/components/ui/typography";
import { auth } from "~/lib/auth";
import { getMyTeamMemberships } from "~/services";
import SyncMemberships from "./_components/join";

export default async function MyOverviewPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) redirect("/");

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

				<SyncMemberships />
			</div>

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
