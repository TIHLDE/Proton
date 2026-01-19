"use server";

import type { User } from "@prisma/client";
import { ArrowLeft } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "~/components/ui/button";
import { H1 } from "~/components/ui/typography";
import { auth } from "~/lib/auth";
import { getTeam, hasTeamAccess } from "~/services";
import AttendanceStats from "./_components/attendance-stats";

interface TeamStatistikkPageProps {
	params: Promise<{ id: string }>;
}

export default async function TeamStatistikkPage({
	params,
}: TeamStatistikkPageProps) {
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
		<div className="mx-auto min-h-screen w-full max-w-7xl space-y-12 px-2 py-24 md:space-y-20 md:py-32 lg:px-12">
			<div className="space-y-4">
				<Button asChild variant="ghost" size="sm">
					<Link href={`/lag/${id}`}>
						<ArrowLeft />
						Tilbake til {team.name}
					</Link>
				</Button>
				<H1>Oppmøtestatistikk - {team.name}</H1>
			</div>

			<AttendanceStats teamId={id} />
		</div>
	);
}
