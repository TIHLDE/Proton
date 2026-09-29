"use server";

import type { User } from "@prisma/client";
import { ExternalLink, PackageOpen } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getGroupFineUsers } from "~/actions";
import { Button } from "~/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";
import { H2, P } from "~/components/ui/typography";
import { auth } from "~/lib/auth";
import { photonFailureMessage, tihldeFinesUrl } from "~/lib/photon";
import { getTeam, hasTeamAccess } from "~/services";

interface TeamBoterPageProps {
	params: Promise<{ id: string }>;
}

const boter = (quantity: number) =>
	`${quantity} ${quantity === 1 || quantity === -1 ? "bot" : "bøter"}`;

/**
 * Bøtene bor på tihlde.org. Siden viser bare tallene derfra og lenker videre;
 * godkjenning, betaling og sletting gjøres der.
 */
export default async function TeamBoterPage({ params }: TeamBoterPageProps) {
	const { id } = await params;

	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) notFound();

	const membership = await hasTeamAccess(id, session.user as User);
	if (!membership) notFound();

	const team = await getTeam(id);
	if (!team) notFound();

	const result = team.slug ? await getGroupFineUsers(team.slug) : null;
	// Photon tar med alle medlemmer, også dem uten bøter. De er bare støy her.
	const users = result?.ok
		? result.data.filter((user) => user.finesCount > 0)
		: [];
	const total = users.reduce((sum, user) => sum + user.finesAmount, 0);

	const errorMessage = !team.slug
		? "Laget er ikke koblet til en gruppe på tihlde.org."
		: result && !result.ok
			? photonFailureMessage(result)
			: null;

	return (
		<div className="space-y-12 md:space-y-20">
			<div className="space-y-4 md:flex md:items-center md:justify-between md:space-y-0">
				<div className="space-y-4">
					<H2>Bøter</H2>
					<P>
						Bøter som venter på godkjenning eller ikke er betalt, hentet fra
						tihlde.org.
					</P>
				</div>

				{team.slug && (
					<Button
						variant="outline"
						nativeButton={false}
						render={
							<Link
								href={tihldeFinesUrl(team.slug)}
								target="_blank"
								rel="noreferrer"
							/>
						}
					>
						Åpne på tihlde.org
						<ExternalLink />
					</Button>
				)}
			</div>

			{errorMessage ? (
				<div className="mx-auto w-full space-y-12 rounded-lg border bg-card p-20 shadow">
					<PackageOpen className="mx-auto h-16 w-16 stroke-[1px] text-muted-foreground" />
					<div className="space-y-2 text-center">
						<H2>Fikk ikke hentet bøtene</H2>
						<P>{errorMessage}</P>
					</div>
				</div>
			) : users.length === 0 ? (
				<div className="mx-auto w-full space-y-12 rounded-lg border bg-card p-20 shadow">
					<PackageOpen className="mx-auto h-16 w-16 stroke-[1px] text-muted-foreground" />
					<div className="space-y-2 text-center">
						<H2>Ingen utestående bøter</H2>
						<P>Alle bøter i gruppa er gjort opp.</P>
					</div>
				</div>
			) : (
				<div className="space-y-4">
					<P>Totalt utestående: {boter(total)}.</P>
					<div className="rounded-lg border bg-card shadow-sm">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Spiller</TableHead>
									<TableHead className="text-right">Antall bøter</TableHead>
									<TableHead className="text-right">Registreringer</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{users.map((user) => (
									<TableRow key={user.id}>
										<TableCell className="font-medium">{user.name}</TableCell>
										<TableCell className="text-right">
											{boter(user.finesAmount)}
										</TableCell>
										<TableCell className="text-right text-muted-foreground">
											{user.finesCount}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</div>
			)}
		</div>
	);
}
