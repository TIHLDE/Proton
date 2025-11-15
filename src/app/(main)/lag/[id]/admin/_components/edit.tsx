"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { TeamEvent } from "@prisma/client";
import { format } from "date-fns";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { UpdateEventInputSchema } from "~/schemas";
import { api } from "~/trpc/react";

interface EditEventProps {
	event: TeamEvent;
	teamId: string;
}

export default function EditEvent({ event, teamId }: EditEventProps) {
	const [open, setOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const router = useRouter();

	const form = useForm<z.infer<typeof UpdateEventInputSchema>>({
		resolver: zodResolver(UpdateEventInputSchema),
		defaultValues: {
			id: event.id,
			name: event.name,
			datetime: new Date(event.startAt),
			type: event.eventType,
			location: event.location || "",
			note: event.note || "",
		},
	});

	const { mutate: updateEvent, status } = api.event.update.useMutation({
		onSuccess: () => {
			toast.success("Arrangement oppdatert");
			setOpen(false);
			router.refresh();
		},
		onError: (error) => {
			toast.error(
				error.message || "Det oppstod en feil ved oppdatering av arrangementet",
			);
		},
	});

	const { mutate: deleteEvent, status: deleteStatus } =
		api.event.delete.useMutation({
			onSuccess: () => {
				toast.success("Arrangement slettet");
				setDeleteOpen(false);
				setOpen(false);
				router.refresh();
			},
			onError: (error) => {
				toast.error(
					error.message || "Det oppstod en feil ved sletting av arrangementet",
				);
			},
		});

	const onSubmit = async (data: z.infer<typeof UpdateEventInputSchema>) =>
		updateEvent(data);

	const onDelete = async () => {
		deleteEvent({
			id: event.id,
			teamId,
		});
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button size="sm">
					<Pencil className="h-4 w-4" />
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px] md:w-full md:max-w-xl">
				<DialogHeader>
					<DialogTitle>Rediger arrangement</DialogTitle>
					<DialogDescription>
						Endre informasjonen for arrangementet.
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Navn</FormLabel>
									<FormControl>
										<Input placeholder="Arrangementets navn" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid items-start gap-6 md:grid-cols-2">
							<FormField
								control={form.control}
								name="datetime"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Starttid</FormLabel>
										<FormControl>
											<Input
												type="datetime-local"
												value={
													field.value
														? format(field.value, "yyyy-MM-dd'T'HH:mm")
														: ""
												}
												onChange={(e) => {
													const value = e.target.value;
													if (value) {
														field.onChange(new Date(value));
													}
												}}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="endAt"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Sluttid</FormLabel>
										<FormControl>
											<Input
												type="datetime-local"
												value={
													field.value
														? format(field.value, "yyyy-MM-dd'T'HH:mm")
														: ""
												}
												onChange={(e) => {
													const value = e.target.value;
													if (value) {
														field.onChange(new Date(value));
													}
												}}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="grid items-start gap-6 md:grid-cols-2">
							<FormField
								control={form.control}
								name="type"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Type</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger className="bg-card">
													<SelectValue placeholder="Velg type arrangement" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="TRAINING">Trening</SelectItem>
												<SelectItem value="MATCH">Kamp</SelectItem>
												<SelectItem value="SOCIAL">Sosialt</SelectItem>
												<SelectItem value="OTHER">Annet</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="location"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Sted</FormLabel>
										<FormControl>
											<Input
												placeholder="Hvor skal arrangementet være?"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="note"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Notat</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Ekstra informasjon om arrangementet"
											className="resize-none"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="flex justify-end gap-2">
							<Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
								<DialogTrigger asChild>
									<Button
										type="button"
										variant="destructive"
										size="sm"
										disabled={
											status === "pending" || deleteStatus === "pending"
										}
									>
										Slett arrangement
									</Button>
								</DialogTrigger>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>Bekreft sletting</DialogTitle>
										<DialogDescription>
											Er du sikker på at du vil slette arrangementet "
											{event.name}"? Denne handlingen kan ikke angres.
										</DialogDescription>
									</DialogHeader>
									<div className="mt-6 flex justify-end gap-2">
										<Button
											type="button"
											variant="outline"
											onClick={() => setDeleteOpen(false)}
											disabled={deleteStatus === "pending"}
										>
											Avbryt
										</Button>
										<Button
											type="button"
											variant="destructive"
											onClick={onDelete}
											disabled={deleteStatus === "pending"}
										>
											{deleteStatus === "pending"
												? "Sletter..."
												: "Slett arrangement"}
										</Button>
									</div>
								</DialogContent>
							</Dialog>

							<SubmitButton
								status={status}
								text="Lagre endringer"
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
