import type { User } from "@prisma/client";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { H1 } from "~/components/ui/typography";
import { auth } from "~/lib/auth";
import { getTeam, getTeamMembershipRoles, hasTeamAccess } from "~/services";
import { TeamTabs } from "./_components/team-tabs";

interface TeamLayoutProps {
	children: React.ReactNode;
	params: Promise<{ id: string }>;
}

/**
 * Lagtittel og faner bor her, ikke på hver enkelt side. Da overlever
 * fane-raden navigasjonen mellom seksjonene, og den aktive markøren kan gli
 * på plass i stedet for å remountes — samme oppførsel som i Photon.
 */
export default async function TeamLayout({
	children,
	params,
}: TeamLayoutProps) {
	const { id } = await params;

	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) redirect("/");

	const membership = await hasTeamAccess(id, session.user as User);
	if (!membership) notFound();

	const team = await getTeam(id);
	if (!team) notFound();

	const roles = await getTeamMembershipRoles(session.user.id, id);

	return (
		<div className="mx-auto min-h-screen w-full max-w-7xl space-y-12 px-2 py-24 md:space-y-20 md:py-32 lg:px-12">
			<div className="space-y-4">
				<H1>{team.name}</H1>
				<TeamTabs
					teamId={team.id}
					showAdmin={
						roles.includes("ADMIN") ||
						roles.includes("SUBADMIN") ||
						session.user.isAdmin
					}
				/>
			</div>

			{children}
		</div>
	);
}
