"use client";

import type { User } from "@prisma/client";
import { CircleHelp } from "lucide-react";
import Navigation from "~/components/navigation/navigation";
import SearchInput from "~/components/navigation/search-input";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";
import EditRole from "./edit";

interface UsersTableProps {
	users: User[];
	page: number;
	nextPage: number | null;
	count: number;
	totalPages: number;
}

export default function UsersTable({
	users,
	page,
	nextPage,
	count,
	totalPages,
}: UsersTableProps) {
	return (
		<div className="space-y-8 rounded-lg border bg-card p-4 shadow-sm">
			<div className="space-y-4 md:flex md:items-start md:justify-between md:space-y-0">
				<Alert className="w-auto">
					<CircleHelp />
					<AlertTitle>Alle brukere</AlertTitle>
					<AlertDescription>
						Se og administrer alle brukere i systemet.
					</AlertDescription>
				</Alert>

				<div className="rounded-lg border bg-background px-4 py-2">
					<p className="text-center font-medium text-bong-purple-800 text-sm">
						{count.toLocaleString("no-NO")} bruker{count !== 1 ? "e" : ""}
					</p>
				</div>
			</div>

			<SearchInput placeholder="Søk etter bruker" />

			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Navn</TableHead>
						<TableHead>Epost</TableHead>
						<TableHead>Rolle</TableHead>
						<TableHead>Opprettet</TableHead>
						<TableHead className="sr-only" />
					</TableRow>
				</TableHeader>
				<TableBody>
					{users.map((user) => (
						<TableRow key={user.id}>
							<TableCell>{user.name}</TableCell>
							<TableCell>{user.email}</TableCell>
							<TableCell>{user.isAdmin ? "Admin" : "Medlem"}</TableCell>
							<TableCell>
								{user.createdAt.toLocaleDateString("no-NO", {
									year: "numeric",
									month: "long",
									day: "numeric",
								})}
							</TableCell>
							<TableCell>
								<EditRole userId={user.id} isAdmin={user.isAdmin} />
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>

			<div className="flex justify-center md:justify-end">
				<Navigation page={page} nextPage={nextPage} totalPages={totalPages} />
			</div>
		</div>
	);
}
