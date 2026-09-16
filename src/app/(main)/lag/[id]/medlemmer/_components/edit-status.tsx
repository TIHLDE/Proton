"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { UserX } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import { UpdateTeamMembershipStatusSchema } from "~/schemas";
import { api } from "~/trpc/react";

interface EditStatusProps {
	membershipId: string;
	teamId: string;
	memberName: string;
	isActive: boolean;
	comment: string | null;
}

export default function EditStatus({
	membershipId,
	teamId,
	memberName,
	isActive,
	comment,
}: EditStatusProps) {
	const [open, setOpen] = useState(false);
	const router = useRouter();

	const form = useForm<z.infer<typeof UpdateTeamMembershipStatusSchema>>({
		resolver: zodResolver(UpdateTeamMembershipStatusSchema),
		defaultValues: {
			membershipId,
			teamId,
			isActive,
			comment: comment || "",
		},
	});

	const { mutate: updateStatus, status } =
		api.team.membership.updateStatus.useMutation({
			onSuccess: () => {
				toast.success("Statusen til brukeren ble oppdatert.");
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
				membershipId,
				teamId,
				isActive,
				comment: comment || "",
			});
		}
	}, [open]);

	const onSubmit = async (
		values: z.infer<typeof UpdateTeamMembershipStatusSchema>,
	) => updateStatus(values);

	const activeValue = form.watch("isActive");

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger
				render={
					<Button variant="link">
						{isActive ? "Sett som inaktiv" : "Sett som aktiv"}
						<UserX />
					</Button>
				}
			/>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="text-left">Medlemsstatus</DialogTitle>
					<DialogDescription className="text-left">
						Marker om {memberName} er aktiv i laget. Dette er kun en synlig
						markering, og påvirker ikke påmelding eller varsler.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
						<div className="flex items-center justify-between space-x-2">
							<Label htmlFor="is-active">Aktiv i laget</Label>
							<Switch
								id="is-active"
								checked={activeValue}
								onCheckedChange={(checked) => {
									form.setValue("isActive", checked, { shouldValidate: true });
									if (checked) {
										form.setValue("comment", "");
									}
								}}
							/>
						</div>

						{!activeValue && (
							<FormField
								control={form.control}
								name="comment"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Kommentar</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Hvorfor er spilleren satt som inaktiv?"
												className="resize-none"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}

						<div className="grid gap-2">
							<SubmitButton className="w-full" text="Lagre" status={status} />
							<DialogClose
								render={
									<Button type="button" variant="ghost" className="w-full">
										Avbryt
									</Button>
								}
							/>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
