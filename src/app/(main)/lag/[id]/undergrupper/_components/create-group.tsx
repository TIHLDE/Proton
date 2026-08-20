"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
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
import { CreateTeamGroupSchema } from "~/schemas";
import { api } from "~/trpc/react";

interface CreateGroupProps {
	teamId: string;
}

export default function CreateGroup({ teamId }: CreateGroupProps) {
	const [open, setOpen] = useState(false);
	const router = useRouter();

	const form = useForm<z.infer<typeof CreateTeamGroupSchema>>({
		resolver: zodResolver(CreateTeamGroupSchema),
		defaultValues: {
			teamId,
			name: "",
			description: "",
		},
	});

	const { mutate: createGroup, status } = api.group.create.useMutation({
		onSuccess: () => {
			toast.success("Undergruppen ble opprettet.");
			setOpen(false);
			form.reset({ teamId, name: "", description: "" });
			router.refresh();
		},
		onError: (error) => toast.error(error.message),
	});

	const onSubmit = (values: z.infer<typeof CreateTeamGroupSchema>) =>
		createGroup(values);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>
					<Plus />
					Ny undergruppe
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Ny undergruppe</DialogTitle>
					<DialogDescription>
						Del laget inn slik dere selv vil, for eksempel 11'er og 7'er.
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
										<Input placeholder="11'er" {...field} />
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
										<Textarea
											placeholder="Hvem hører til her?"
											{...field}
											value={field.value ?? ""}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid gap-2">
							<SubmitButton text="Opprett" status={status} />
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
