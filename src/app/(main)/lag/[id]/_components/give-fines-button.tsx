"use client";

import type { TeamEventType } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { Skeleton } from "~/components/ui/skeleton";
import { P } from "~/components/ui/typography";
import { api } from "~/trpc/react";

interface GiveFinesButtonProps {
	eventId: string;
	eventType: TeamEventType;
}

interface NonRespondedMember {
	id: string;
	user: { id: string; name: string; image: string | null };
}

export default function GiveFinesButton({
	eventId,
	eventType,
}: GiveFinesButtonProps) {
	const [open, setOpen] = useState(false);
	const router = useRouter();

	const { data: nonResponded, isLoading } =
		api.registration.getNonResponded.useQuery({ eventId }, { enabled: open });

	const { mutate: issueFines, isPending } =
		api.fine.issueForNonResponders.useMutation({
			onSuccess: ({ issuedCount }) => {
				router.refresh();
				setOpen(false);
				if (issuedCount > 0) {
					toast.success(
						`Ga bot til ${issuedCount} ${issuedCount === 1 ? "person" : "personer"}.`,
					);
				} else {
					toast.info(
						"Ingen nye bøter — alle som manglet svar hadde alt fått bot.",
					);
				}
			},
			onError: (error) => {
				toast.error(error.message);
			},
		});

	const amountLabel = eventType === "MATCH" ? "2 bøter" : "1 bot";
	const hasNonResponded = (nonResponded?.length ?? 0) > 0;

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger
				render={
					<Button variant="outline" className="w-full">
						Gi bøter til ikke-svarte
					</Button>
				}
			/>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Gi bøter til ikke-svarte</DialogTitle>
					<DialogDescription>
						Alle under mangler svar på arrangementet, og får {amountLabel} hver
						om du bekrefter.
					</DialogDescription>
				</DialogHeader>

				{isLoading && (
					<div className="space-y-2">
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
					</div>
				)}

				{!isLoading && !hasNonResponded && (
					<P className="text-muted-foreground">
						Alle har svart — ingen bøter å gi.
					</P>
				)}

				{!isLoading && hasNonResponded && (
					<div className="max-h-64 space-y-2 overflow-y-auto">
						{nonResponded?.map((member: NonRespondedMember) => (
							<div key={member.id} className="flex items-center gap-3">
								<Avatar>
									<AvatarImage
										src={member.user.image ?? undefined}
										alt={member.user.name}
									/>
									<AvatarFallback>{member.user.name[0]}</AvatarFallback>
								</Avatar>
								<span>{member.user.name}</span>
							</div>
						))}
					</div>
				)}

				<Button
					className="w-full"
					disabled={isPending || isLoading || !hasNonResponded}
					onClick={() => issueFines({ eventId })}
				>
					{isPending ? "Gir bøter..." : "Bekreft"}
				</Button>
			</DialogContent>
		</Dialog>
	);
}
