"use server";

import type { User } from "@prisma/client";
import { PackageOpen } from "lucide-react";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";
import { H2, H3, P } from "~/components/ui/typography";
import { auth } from "~/lib/auth";
import { formatInAppZone } from "~/lib/datetime";
import { getEventTypeLabel } from "~/lib/event-presentation";
import {
	getFinesByTeam,
	getTeam,
	getTeamMembershipRoles,
	hasTeamAccess,
} from "~/services";
import ReverseFine from "./_components/reverse-fine";

interface TeamFinesPageProps {
	params: Promise<{ id: string }>;
}

export default async function TeamFinesPage({ params }: TeamFinesPageProps) {
	const { id } = await params;

	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) notFound();

	const membership = await hasTeamAccess(id, session.user as User);

	if (!membership) notFound();

	const team = await getTeam(id);

	if (!team) notFound();

	const roles = await getTeamMembershipRoles(session.user.id, id);
	const isAdmin =
		session.user.isAdmin ||
		roles.includes("ADMIN") ||
		roles.includes("SUBADMIN");

	const fines = await getFinesByTeam(id);

	const summary = (() => {
		const totals = new Map<
			string,
			{ name: string; count: number; amount: number }
		>();
		for (const fine of fines) {
			if (fine.reversed) continue;
			const entry = totals.get(fine.userId) ?? {
				name: fine.user.name,
				count: 0,
				amount: 0,
			};
			entry.count += 1;
			entry.amount += fine.amount;
			totals.set(fine.userId, entry);
		}
		return [...totals.values()].sort((a, b) => b.amount - a.amount);
	})();

	return (
		<div className="space-y-12 md:space-y-20">
			<div className="space-y-4">
				<H2>Bøter</H2>
				<P>
					Bøter gis til de som ikke har svart på trening eller kamp innen
					påmeldingsfristen — aldri som en fellesbot til hele laget.
				</P>
			</div>

			{fines.length === 0 && (
				<div className="mx-auto w-full space-y-12 rounded-lg border bg-card p-20 shadow">
					<PackageOpen className="mx-auto h-16 w-16 stroke-[1px] text-muted-foreground" />
					<div className="space-y-2 text-center">
						<H2>Ingen bøter</H2>
						<P>
							{isAdmin ? "Ingen har fått bot ennå." : "Laget har ingen bøter."}
						</P>
					</div>
				</div>
			)}

			{fines.length > 0 && (
				<>
					<div className="space-y-4">
						<H3>Oppsummering</H3>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Navn</TableHead>
									<TableHead>Antall bøter</TableHead>
									<TableHead>Sum enheter</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{summary.map((row) => (
									<TableRow key={row.name}>
										<TableCell>{row.name}</TableCell>
										<TableCell>{row.count}</TableCell>
										<TableCell>{row.amount}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>

					<div className="space-y-4">
						<H3>Historikk</H3>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Navn</TableHead>
									<TableHead>Arrangement</TableHead>
									<TableHead>Antall</TableHead>
									<TableHead>Dato</TableHead>
									<TableHead>Gitt av</TableHead>
									<TableHead>Status</TableHead>
									{isAdmin && <TableHead />}
								</TableRow>
							</TableHeader>
							<TableBody>
								{fines.map((fine) => (
									<TableRow key={fine.id}>
										<TableCell>{fine.user.name}</TableCell>
										<TableCell>
											{fine.event.name} (
											{getEventTypeLabel(fine.event.eventType)})
										</TableCell>
										<TableCell
											className={
												fine.reversed
													? "text-muted-foreground line-through"
													: undefined
											}
										>
											{fine.amount}
										</TableCell>
										<TableCell>
											{formatInAppZone(
												fine.createdAt,
												"d. MMM yyyy 'kl.' HH:mm",
											)}
										</TableCell>
										<TableCell>{fine.issuedBy.name}</TableCell>
										<TableCell>
											{fine.reversed
												? `Reversert${fine.reversedBy ? ` av ${fine.reversedBy.name}` : ""}`
												: "Aktiv"}
										</TableCell>
										{isAdmin && (
											<TableCell>
												{!fine.reversed && <ReverseFine fineId={fine.id} />}
											</TableCell>
										)}
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</>
			)}
		</div>
	);
}
