"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type z from "zod";
import SubmitButton from "~/components/form/submit-button";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { UpdateTeamGroupSchema } from "~/schemas";
import { api } from "~/trpc/react";

interface EditGroupProps {
	groupId: string;
	name: string;
	description: string | null;
}

export default function EditGroup({
	groupId,
	name,
	description,
}: EditGroupProps) {
	const [open, setOpen] = useState(false);
	const router = useRouter();

	const form = useForm<z.infer<typeof UpdateTeamGroupSchema>>({
		resolver: zodResolver(UpdateTeamGroupSchema),
		defaultValues: {
			groupId,
			name,
			description: description ?? "",
		},
	});

	const { mutate: updateGroup, status } = api.group.update.useMutation({
		onSuccess: () => {
			toast.success("Undergruppen ble oppdatert.");
			setOpen(false);
			router.refresh();
		},
		onError: (error) => toast.error(error.message),
	});

	const onSubmit = (values: z.infer<typeof UpdateTeamGroupSchema>) =>
		updateGroup(values);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="ghost" size="sm">
					<Pencil />
					Endre
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Endre undergruppe</DialogTitle>
					<DialogDescription>
						Gi gruppa nytt navn eller tekst.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Navn</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Beskrivelse (valgfritt)</FormLabel>
									<FormControl>
										<Textarea {...field} value={field.value ?? ""} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid gap-2">
							<SubmitButton text="Lagre" status={status} />
							<DialogClose asChild>
								<Button type="button" variant="ghost">
									Avbryt
								</Button>
							</DialogClose>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
