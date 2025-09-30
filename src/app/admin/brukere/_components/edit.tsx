"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PencilIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import SubmitButton from "~/components/form/submit-button";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { Form } from "~/components/ui/form";
import { UpdateUserRoleInputSchema } from "~/schemas";
import { api } from "~/trpc/react";

interface EditRoleProps {
	userId: string;
	isAdmin: boolean;
}

export default function EditRole({ userId, isAdmin }: EditRoleProps) {
	const [open, setOpen] = useState<boolean>(false);
	const router = useRouter();

	const form = useForm<z.infer<typeof UpdateUserRoleInputSchema>>({
		resolver: zodResolver(UpdateUserRoleInputSchema),
		defaultValues: {
			userId,
			isAdmin,
		},
	});

	const { mutate: updateUser, status } = api.user.updateRole.useMutation({
		onSuccess: () => {
			toast.success(isAdmin ? "Bruker er nå medlem" : "Bruker er nå admin");
			setOpen(false);
			router.refresh();
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	useEffect(() => {
		if (open) {
			form.reset({
				userId,
				isAdmin,
			});
		}
	}, [userId]);

	const onSubmit = async (values: z.infer<typeof UpdateUserRoleInputSchema>) =>
		updateUser(values);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="link" size="sm">
					Rediger
					<PencilIcon className="h-4 w-4" />
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-xl">
				<DialogHeader>
					<DialogTitle>Oppdater rolle</DialogTitle>
					<DialogDescription>
						Oppdater rollen til denne brukeren.
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="mt-6">
						<SubmitButton
							className="w-full"
							text={isAdmin ? "Gjør til medlem" : "Gjør til admin"}
							status={status}
						/>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
