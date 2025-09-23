"use server";

import type { User } from "@prisma/client";
import { ArrowRight, UsersRound } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "~/components/ui/button";
import { H1 } from "~/components/ui/typography";
import { auth } from "~/lib/auth";
import { getTeam, hasTeamAccess } from "~/services";

interface TeamPageProps {
	params: Promise<{ id: string }>;
}

export default async function TeamPage({ params }: TeamPageProps) {
	const { id } = await params;

	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) notFound();

	const membership = await hasTeamAccess(id, session.user as User);

	if (!membership) notFound();

	const team = await getTeam(id);

	if (!team) notFound();

	return (
		<div className="mx-auto min-h-screen w-full max-w-7xl space-y-20 px-2 py-32 lg:px-12">
			<div className="flex items-center justify-between">
				<div>
					<H1>{team.name}</H1>
				</div>

				<div className="grid grid-cols-2 gap-x-4">
					{membership === "ADMIN" && (
						<Button asChild>
							<Link href={`/lag/${team.id}/admin`}>
								Administrer lag
								<ArrowRight />
							</Link>
						</Button>
					)}
					<Button asChild variant="outline">
						<Link href={`/lag/${team.id}/medlemmer`}>
							<UsersRound />
							Medlemmer
						</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}
