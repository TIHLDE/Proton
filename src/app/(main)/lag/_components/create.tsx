"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type z from "zod";
import FormInput from "~/components/form/input";
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
import { CreateTeamInputSchema } from "~/schemas";
import { api } from "~/trpc/react";

export default function CreateTeam() {
	const [open, setOpen] = useState<boolean>(false);
	const router = useRouter();

	const form = useForm<z.infer<typeof CreateTeamInputSchema>>({
		resolver: zodResolver(CreateTeamInputSchema),
	});

	const { mutate: createTeam, status } = api.team.create.useMutation({
		onSuccess: () => {
			setOpen(false);
			form.reset({
				name: "",
				slug: "",
			});
			router.refresh();
			toast.success("Lag opprettet!");
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const onSubmit = async (values: z.infer<typeof CreateTeamInputSchema>) =>
		createTeam(values);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>
					<Plus />
					Opprett lag
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Opprett nytt lag</DialogTitle>
					<DialogDescription>
						Fyll inn informasjonen under for å opprette et nytt idrettslag.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form
						className="mt-6 space-y-8"
						onSubmit={form.handleSubmit(onSubmit)}
					>
						<FormInput
							form={form}
							name="name"
							label="Navn"
							placeholder="Navn på laget"
							required
						/>

						<FormInput
							form={form}
							name="slug"
							label="Nettside-slug"
							placeholder="Nettside-slug til laget"
							description="Vi trenger denne for å hente medlemskap"
						/>

						<div className="md:flex md:justify-end">
							<SubmitButton
								status={status}
								text="Opprett lag"
								size="sm"
								className="md:w-auto"
							/>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
