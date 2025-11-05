"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { Team } from "@prisma/client";
import { CircleAlertIcon, Pencil } from "lucide-react";
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
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { Form } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { UpdateTeamInputSchema } from "~/schemas";
import { api } from "~/trpc/react";

interface EditTeamProps {
	team: Team;
}

export default function EditTeam({ team }: EditTeamProps) {
	const [open, setOpen] = useState<boolean>(false);
	const [deleteOpen, setDeleteOpen] = useState<boolean>(false);
	const [inputValue, setInputValue] = useState<string>("");
	const router = useRouter();

	const form = useForm<z.infer<typeof UpdateTeamInputSchema>>({
		resolver: zodResolver(UpdateTeamInputSchema),
		defaultValues: {
			id: team.id,
			name: team.name,
			slug: team.slug || "",
		},
	});

	const { mutate: updateTeam, status } = api.team.update.useMutation({
		onSuccess: () => {
			setOpen(false);
			router.refresh();
			toast.success("Lag oppdatert!");
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const { mutate: deleteTeam, status: deleteStatus } =
		api.team.delete.useMutation({
			onSuccess: () => {
				setDeleteOpen(false);
				setOpen(false);
				router.refresh();
				toast.success("Lag slettet!");
			},
			onError: (error) => {
				toast.error(error.message);
			},
		});

	const onSubmit = async (values: z.infer<typeof UpdateTeamInputSchema>) =>
		updateTeam(values);

	const onDelete = () => {
		deleteTeam({ id: team.id });
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button size="sm" variant="outline">
					<Pencil className="h-4 w-4" />
				</Button>
			</DialogTrigger>
			<DialogContent className="md:max-w-md">
				<div className="mb-4 flex flex-col items-center gap-2">
					<div
						className="flex size-11 shrink-0 items-center justify-center rounded-full border"
						aria-hidden="true"
					>
						<Pencil className="size-5" />
					</div>
					<DialogHeader>
						<DialogTitle className="sm:text-center">Rediger lag</DialogTitle>
						<DialogDescription className="sm:text-center">
							Endre informasjonen under for å oppdatere idrettslaget.
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

						<div className="grid gap-2">
							<SubmitButton
								status={status}
								text="Endre laget"
								className="w-full"
							/>

							<div className="my-1 flex items-center gap-3 before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
								<span className="text-muted-foreground text-xs">Eller</span>
							</div>

							<Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
								<DialogTrigger asChild>
									<Button variant="destructive">Slett lag</Button>
								</DialogTrigger>
								<DialogContent className="md:max-w-sm">
									<div className="mb-4 flex flex-col items-center gap-2">
										<div
											className="flex size-9 shrink-0 items-center justify-center rounded-full border"
											aria-hidden="true"
										>
											<CircleAlertIcon className="opacity-80" size={16} />
										</div>
										<DialogHeader>
											<DialogTitle className="sm:text-center">
												Endelig bekreftelse
											</DialogTitle>
											<DialogDescription className="sm:text-center">
												Denne handlingen kan ikke angres. For å bekrefte,
												vennligst skriv inn navnet på laget{" "}
												<span className="text-foreground">{team.name}</span>.
											</DialogDescription>
										</DialogHeader>
									</div>

									<form className="space-y-5">
										<div className="*:not-first:mt-2">
											<Label>Lagets navn</Label>
											<Input
												type="text"
												placeholder="Skriv lagets navn for å bekrefte"
												value={inputValue}
												onChange={(e) => setInputValue(e.target.value)}
											/>
										</div>
										<DialogFooter>
											<DialogClose asChild>
												<Button
													type="button"
													variant="outline"
													className="flex-1"
												>
													Avbryt
												</Button>
											</DialogClose>
											<Button
												type="button"
												variant="destructive"
												onClick={onDelete}
												disabled={
													deleteStatus === "pending" || inputValue !== team.name
												}
												className="flex-1"
											>
												{deleteStatus === "pending" ? (
													<span>Sletter...</span>
												) : (
													<span>Slett laget</span>
												)}
											</Button>
										</DialogFooter>
									</form>
								</DialogContent>
							</Dialog>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
