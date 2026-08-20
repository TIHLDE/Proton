"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";

interface RemoveAssignmentProps {
	assignmentId: string;
	label: string;
}

export default function RemoveAssignment({
	assignmentId,
	label,
}: RemoveAssignmentProps) {
	const router = useRouter();

	const { mutate: removeAssignment } =
		api.leadership.removeAssignment.useMutation({
			onSuccess: () => router.refresh(),
			onError: (error) => toast.error(error.message),
		});

	return (
		<Button
			variant="ghost"
			size="sm"
			aria-label={`Fjern ${label}`}
			onClick={() => removeAssignment({ assignmentId })}
		>
			<X />
		</Button>
	);
}
