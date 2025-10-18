"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
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
import { api } from "~/trpc/react";

const eventSchema = z.object({
	name: z.string().min(1, "Navn er påkrevd"),
	datetime: z.date({
		required_error: "Dato og tid er påkrevd",
	}),
	type: z.enum(["TRAINING", "MATCH", "SOCIAL", "OTHER"], {
		required_error: "Type er påkrevd",
	}),
	location: z.string().optional(),
	note: z.string().optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

interface CreateEventProps {
	teamId: string;
}

export default function CreateEvent({ teamId }: CreateEventProps) {
	const [open, setOpen] = useState(false);
	const router = useRouter();

	const form = useForm<EventFormData>({
		resolver: zodResolver(eventSchema),
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

	const onSubmit = async (data: EventFormData) => {
		createEvent({
			teamId,
			name: data.name,
			datetime: data.datetime,
			type: data.type,
			location: data.location,
			note: data.note,
		});
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>
					<Plus className="mr-2 h-4 w-4" />
					Nytt arrangement
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Opprett nytt arrangement</DialogTitle>
					<DialogDescription>
						Fyll ut skjemaet nedenfor for å opprette et nytt arrangement.
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

						<FormField
							control={form.control}
							name="datetime"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Dato og tid</FormLabel>
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
							name="type"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Type</FormLabel>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger>
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
