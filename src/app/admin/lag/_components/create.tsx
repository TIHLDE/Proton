"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Award, Plus } from "lucide-react";
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
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "~/components/ui/form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { teamCategoryOptions } from "~/lib/team-presentation";
import { CreateTeamInputSchema } from "~/schemas";
import { api } from "~/trpc/react";

export default function CreateTeam() {
	const [open, setOpen] = useState<boolean>(false);
	const router = useRouter();

	const form = useForm<z.infer<typeof CreateTeamInputSchema>>({
		resolver: zodResolver(CreateTeamInputSchema),
		// Uten disse er feltene `undefined`, og Zod avviser på type med sin
		// egen engelske «Required» i stedet for meldinga i skjemaet.
		defaultValues: {
			name: "",
			slug: "",
			category: "TIHLDE",
			logoUrl: "",
			emoji: "",
		},
	});

	const { mutate: createTeam, status } = api.team.create.useMutation({
		onSuccess: () => {
			setOpen(false);
			form.reset({
				name: "",
				slug: "",
				category: "TIHLDE",
				logoUrl: "",
				emoji: "",
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
			<DialogTrigger
				render={
					<Button>
						<Plus />
						Opprett lag
					</Button>
				}
			/>
			<DialogContent className="md:max-w-md">
				<div className="mb-4 flex flex-col items-center gap-2">
					<div
						className="flex size-11 shrink-0 items-center justify-center rounded-full border"
						aria-hidden="true"
					>
						<Award className="size-5" />
					</div>
					<DialogHeader>
						<DialogTitle className="sm:text-center">Opprett lag</DialogTitle>
						<DialogDescription className="sm:text-center">
							Fyll inn informasjonen under for å opprette et nytt lag.
						</DialogDescription>
					</DialogHeader>
				</div>

				<Form {...form}>
					<form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
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

						<FormField
							control={form.control}
							name="category"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Fargekategori</FormLabel>
									<Select
										items={teamCategoryOptions}
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger className="w-full bg-card">
												<SelectValue placeholder="Velg fargekategori" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{teamCategoryOptions.map((option) => (
												<SelectItem key={option.value} value={option.value}>
													{option.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormInput
							form={form}
							name="logoUrl"
							label="Logo (URL)"
							placeholder="https://..."
							description="Lenke til et bilde av lagets logo"
						/>

						<FormInput
							form={form}
							name="emoji"
							label="Emoji"
							placeholder="🏐"
							description="Vises ved siden av lagnavnet"
							maxLength={8}
						/>

						<SubmitButton
							status={status}
							text="Opprett lag"
							className="w-full"
						/>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
