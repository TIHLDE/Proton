"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
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
import { Label } from "~/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import { CreateEventInputSchema } from "~/schemas";
import { api } from "~/trpc/react";

interface CreateEventProps {
	teamId: string;
}

export default function CreateEvent({ teamId }: CreateEventProps) {
	const [open, setOpen] = useState(false);
	const [hasDeadline, setHasDeadline] = useState(false);
	const router = useRouter();

	const form = useForm<z.infer<typeof CreateEventInputSchema>>({
		resolver: zodResolver(CreateEventInputSchema),
		defaultValues: {
			name: "",
			type: undefined,
			location: "",
			note: "",
		},
	});

	const { mutate: createEvent, status } = api.event.create.useMutation({
		onSuccess: () => {
			toast.success("Arrangement opprettet");
			setOpen(false);
			form.reset();
			router.refresh();
		},
		onError: (error) => {
			toast.error(
				error.message || "Det oppstod en feil ved opprettelse av arrangementet",
			);
		},
	});

	const onSubmit = async (data: z.infer<typeof CreateEventInputSchema>) =>
		createEvent(data);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>
					<Plus />
					Nytt arrangement
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px] md:w-full md:max-w-xl">
				<DialogHeader>
					<DialogTitle>Opprett nytt arrangement</DialogTitle>
					<DialogDescription>
						Fyll ut skjemaet nedenfor for å opprette et nytt arrangement.
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
													if (e.target.value) {
														field.onChange(new Date(e.target.value));
													}
												}}
												min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="datetime"
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
													if (e.target.value) {
														field.onChange(new Date(e.target.value));
													}
												}}
												min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
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

						<div className="flex items-center justify-between space-x-2">
							<Label htmlFor="has-deadline">Påmeldingsfrist</Label>
							<Switch
								id="has-deadline"
								checked={hasDeadline}
								onCheckedChange={(checked) => {
									setHasDeadline(checked);
									if (!checked) {
										form.setValue("registrationDeadline", undefined);
									}
								}}
							/>
						</div>

						{hasDeadline && (
							<FormField
								control={form.control}
								name="registrationDeadline"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Frist for påmelding</FormLabel>
										<FormControl>
											<Input
												type="datetime-local"
												value={
													field.value
														? format(field.value, "yyyy-MM-dd'T'HH:mm")
														: ""
												}
												onChange={(e) => {
													if (e.target.value) {
														field.onChange(new Date(e.target.value));
													}
												}}
												max={
													form.getValues("datetime")
														? format(
																form.getValues("datetime"),
																"yyyy-MM-dd'T'HH:mm",
															)
														: undefined
												}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}

						<div className="flex justify-end space-x-2 pt-4">
							<Button
								type="button"
								variant="outline"
								onClick={() => setOpen(false)}
								disabled={status === "pending"}
							>
								Avbryt
							</Button>
							<Button type="submit" disabled={status === "pending"}>
								{status === "pending" ? "Oppretter..." : "Opprett arrangement"}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
