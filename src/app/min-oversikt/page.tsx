"use server";

import { PackageOpen } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { H1, H2, P } from "~/components/ui/typography";
import { auth } from "~/lib/auth";
import { getMyTeamMemberships } from "~/services";

export default async function MyOverviewPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) redirect("/");

	const memberships = await getMyTeamMemberships(session.user.id);

	return (
		<div className="mx-auto min-h-screen w-full max-w-7xl space-y-20 px-2 py-32 lg:px-12">
			<div>
				<H1>Mine medlemskap</H1>
				<P>Her kan du se en oversikt over alle idrettslagene du er medlem av</P>
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
		</div>
	);
}
