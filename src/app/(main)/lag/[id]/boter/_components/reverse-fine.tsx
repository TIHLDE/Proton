"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";

interface ReverseFineProps {
	fineId: string;
}

export default function ReverseFine({ fineId }: ReverseFineProps) {
	const router = useRouter();

	const { mutate: reverseFine, isPending } = api.fine.reverse.useMutation({
		onSuccess: () => router.refresh(),
		onError: (error) => toast.error(error.message),
	});

	return (
		<Button
			variant="ghost"
			size="sm"
			disabled={isPending}
			onClick={() => reverseFine({ fineId })}
		>
			Angre
		</Button>
	);
}
