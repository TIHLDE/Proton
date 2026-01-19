"use client";

import type { RegistrationType } from "@prisma/client";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import { H3, P } from "~/components/ui/typography";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

interface RegistrationListProps {
	eventId: string;
	eventName: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	statusFilter: "attending" | "notAttending" | "notResponded" | null;
	isAdmin?: boolean;
}

type Registration = {
	id: string;
	type: RegistrationType;
	comment?: string | null;
	user: {
		id: string;
		name: string;
		image: string | null;
	};
};

type NonRespondedUser = {
	id: string;
	user: {
		id: string;
		name: string;
		image: string | null;
	};
};

export default function RegistrationList({
	eventId,
	eventName,
	open,
	onOpenChange,
	statusFilter,
	isAdmin = false,
}: RegistrationListProps) {
	const utils = api.useUtils();

	const { data: registrations, isLoading: isLoadingRegistrations } =
		api.registration.getAllByEvent.useQuery(
			{ eventId },
			{ enabled: open && statusFilter !== "notResponded" },
		);

	const { data: nonResponded, isLoading: isLoadingNonResponded } =
		api.registration.getNonResponded.useQuery(
			{ eventId },
			{ enabled: open && statusFilter === "notResponded" },
		);

	const { mutate: adminUpdateRegistration, isPending } =
		api.registration.adminUpdate.useMutation({
			onSuccess: () => {
				toast.success("Påmelding oppdatert");
				utils.registration.getAllByEvent.invalidate({ eventId });
				utils.registration.getCounts.invalidate({ eventId });
				utils.registration.getNonResponded.invalidate({ eventId });
			},
			onError: (error) => {
				toast.error(error.message || "Kunne ikke oppdatere påmelding");
			},
		});

	const getDialogTitle = () => {
		switch (statusFilter) {
			case "attending":
				return "Påmeldt";
			case "notAttending":
				return "Avmeldt";
			case "notResponded":
				return "Ikke svart";
			default:
				return "";
		}
	};

	const getDialogUsers = () => {
		if (statusFilter === "notResponded") {
			return nonResponded || [];
		}

		if (!registrations) return [];

		return registrations.filter((r: Registration) =>
			statusFilter === "attending"
				? r.type === "ATTENDING"
				: r.type === "NOT_ATTENDING",
		);
	};

	const isLoading =
		statusFilter === "notResponded"
			? isLoadingNonResponded
			: isLoadingRegistrations;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-4xl">
				<DialogHeader>
					<DialogTitle>{eventName}</DialogTitle>
				</DialogHeader>

				<div className="space-y-4">
					<H3
						className={cn(
							"mb-3",
							statusFilter === "attending" && "text-green-600",
							statusFilter === "notAttending" && "text-red-600",
							statusFilter === "notResponded" && "text-yellow-600",
						)}
					>
						{getDialogTitle()} ({getDialogUsers().length})
					</H3>
					{getDialogUsers().length === 0 ? (
						<P className="text-muted-foreground">Ingen personer</P>
					) : (
						<div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
							{getDialogUsers().map((item: Registration | NonRespondedUser) => {
								const isRegistration = "comment" in item;
								const registration = isRegistration
									? (item as Registration)
									: null;

								return (
									<div
										key={item.id}
										className="flex flex-col gap-2 rounded-lg border bg-card p-3"
									>
										<div className="flex items-center gap-3">
											{item.user.image && (
												<img
													src={item.user.image}
													alt={item.user.name}
													className="h-8 w-8 rounded-full"
												/>
											)}
											<span className="flex-1">{item.user.name}</span>
										</div>
										{isAdmin &&
											statusFilter === "notAttending" &&
											registration?.comment && (
												<div className="text-muted-foreground text-sm">
													<span className="font-semibold">Grunn: </span>
													{registration.comment}
												</div>
											)}
										{isAdmin && (
											<div className="flex gap-2 pt-2">
												<Button
													size="sm"
													variant={
														registration?.type === "ATTENDING"
															? "default"
															: "outline"
													}
													className="flex-1"
													onClick={() =>
														adminUpdateRegistration({
															userId: item.user.id,
															eventId,
															type: "ATTENDING",
														})
													}
													disabled={
														isPending || registration?.type === "ATTENDING"
													}
												>
													<Check className="h-3 w-3" />
													Kommer
												</Button>
												<Button
													size="sm"
													variant={
														registration?.type === "NOT_ATTENDING"
															? "default"
															: "outline"
													}
													className="flex-1"
													onClick={() =>
														adminUpdateRegistration({
															userId: item.user.id,
															eventId,
															type: "NOT_ATTENDING",
														})
													}
													disabled={
														isPending || registration?.type === "NOT_ATTENDING"
													}
												>
													<X className="h-3 w-3" />
													Kommer ikke
												</Button>
											</div>
										)}
									</div>
								);
							})}
						</div>
					)}
				</div>

				{isLoading && (
					<div className="py-8 text-center">
						<P className="text-muted-foreground">Laster...</P>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
