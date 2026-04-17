"use client";

import type { RegistrationType } from "@prisma/client";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import { P } from "~/components/ui/typography";
import { api } from "~/trpc/react";

interface ConfirmEventAttendanceProps {
	eventId: string;
	eventName: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export default function ConfirmEventAttendance({
	eventId,
	eventName,
	open,
	onOpenChange,
}: ConfirmEventAttendanceProps) {
	const { data: registrations, isLoading } =
		api.registration.getAllByEvent.useQuery({ eventId }, { enabled: open });

	const attending = (registrations ?? []).filter(
		(r: { type: RegistrationType }) => r.type === "ATTENDING",
	);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-4xl">
				<DialogHeader>
					<DialogTitle>Se oppmøte</DialogTitle>
					<DialogDescription>{eventName}</DialogDescription>
				</DialogHeader>

				{isLoading ? (
					<div className="py-8 text-center">
						<P className="text-muted-foreground">Laster...</P>
					</div>
				) : attending.length === 0 ? (
					<P className="text-muted-foreground">Ingen var påmeldt som kommer.</P>
				) : (
					<div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
						{attending.map((row) => (
							<div
								key={row.id}
								className="flex items-center gap-3 rounded-lg border bg-card p-3"
							>
								<Avatar>
									<AvatarImage src={row.user.image ?? undefined} alt={row.user.name} />
									<AvatarFallback>{row.user.name[0]}</AvatarFallback>
								</Avatar>
								<div className="font-medium">{row.user.name}</div>
							</div>
						))}
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
