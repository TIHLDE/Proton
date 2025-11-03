"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { api } from "~/trpc/react";

interface NotifyUnattendedProps {
	eventId: string;
}

export default function NotifyUnattended({ eventId }: NotifyUnattendedProps) {
	const { id } = useParams<{ id: string }>();
	const router = useRouter();
	const [open, setOpen] = useState(false);

	const { mutate: notify, isPending } =
		api.event.registration.notify.useMutation({
			onSuccess: () => {
				router.refresh();
				toast.success("Påminnelse sendt!");
				setOpen(false);
			},
			onError: (error) => {
				toast.error(error.message);
			},
		});

	const handleNotify = async () => {
		notify({
			teamId: id,
			eventId: eventId,
		});
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>Send påminnelse</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Send påminnelse</DialogTitle>
					<DialogDescription>
						Send påminnelse på epost til alle som ikke har meldt seg på
						arrangementet enda.
					</DialogDescription>
				</DialogHeader>
				<Button
					className="mt-4 w-full"
					onClick={handleNotify}
					disabled={isPending}
				>
					Send påminnelse
				</Button>
			</DialogContent>
		</Dialog>
	);
}
