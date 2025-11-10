"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { TeamRole } from "@prisma/client";
import { PencilIcon, Shield } from "lucide-react";
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
import { Form } from "~/components/ui/form";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { cn } from "~/lib/utils";
import { UpdateTeamMembershipRoleSchema } from "~/schemas";
import { api } from "~/trpc/react";

interface EditRoleProps {
	membershipId: string;
	teamId: string;
	role: TeamRole;
}

export default function EditRole({
	membershipId,
	teamId,
	role,
}: EditRoleProps) {
	const [open, setOpen] = useState<boolean>(false);
	const router = useRouter();

	const form = useForm<z.infer<typeof UpdateTeamMembershipRoleSchema>>({
		resolver: zodResolver(UpdateTeamMembershipRoleSchema),
		defaultValues: {
			membershipId,
			teamId,
			role,
		},
	});

	const { mutate: updateUser, status } =
		api.team.membership.updateRole.useMutation({
			onSuccess: () => {
				toast.success("Rollen til brukeren ble oppdatert.");
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
			});
		}
	}, [membershipId]);

	const onSubmit = async (
		values: z.infer<typeof UpdateTeamMembershipRoleSchema>,
	) => updateUser(values);

	const currentRole = form.watch("role");

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="link">
					Endre rolle
					<PencilIcon />
				</Button>
			</DialogTrigger>
			<DialogContent>
				<div className="mb-2 flex flex-col gap-2">
					<div
						className="flex size-11 shrink-0 items-center justify-center rounded-full border"
						aria-hidden="true"
					>
						<Shield className="opacity-80" size={16} />
					</div>
					<DialogHeader>
						<DialogTitle className="text-left">Endre rolle</DialogTitle>
						<DialogDescription className="text-left">
							Velg en ny rolle for denne brukeren.
						</DialogDescription>
					</DialogHeader>
				</div>

				<Form {...form}>
					<form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
						<RadioGroup
							className="gap-2"
							value={currentRole}
							onValueChange={(value) => form.setValue("role", value)}
						>
							<div
								className={cn(
									"relative flex w-full cursor-pointer items-center gap-2 rounded-md border border-input px-4 py-3 shadow-xs outline-none",
									currentRole === "ADMIN" && "border-primary bg-accent",
								)}
							>
								<RadioGroupItem
									value="ADMIN"
									id="ADMIN"
									aria-describedby="ADMIN-description"
									className="order-1 after:absolute after:inset-0"
								/>
								<div className="grid grow gap-1">
									<Label htmlFor="ADMIN">Administrator</Label>
									<p
										id="ADMIN-description"
										className="text-muted-foreground text-xs"
									>
										Bruker har full tilgang til alle administrative funksjoner
										for laget.
									</p>
								</div>
							</div>
							<div
								className={cn(
									"relative flex w-full cursor-pointer items-center gap-2 rounded-md border border-input px-4 py-3 shadow-xs outline-none",
									currentRole === "SUBADMIN" && "border-primary bg-accent",
								)}
							>
								<RadioGroupItem
									value="SUBADMIN"
									id="SUBADMIN"
									aria-describedby="SUBADMIN-description"
									className="order-1 after:absolute after:inset-0"
								/>
								<div className="grid grow gap-1">
									<Label htmlFor="SUBADMIN">Subadministrator</Label>
									<p
										id="SUBADMIN-description"
										className="text-muted-foreground text-xs"
									>
										Bruker har begrenset tilgang til administrative funksjoner
										for laget.
									</p>
								</div>
							</div>
							<div
								className={cn(
									"relative flex w-full cursor-pointer items-center gap-2 rounded-md border border-input px-4 py-3 shadow-xs outline-none",
									currentRole === "USER" && "border-primary bg-accent",
								)}
							>
								<RadioGroupItem
									value="USER"
									id="USER"
									aria-describedby="USER-description"
									className="order-1 after:absolute after:inset-0"
								/>
								<div className="grid grow gap-1">
									<Label htmlFor="USER">Medlem</Label>
									<p
										id="USER-description"
										className="text-muted-foreground text-xs"
									>
										Bruker har ikke tilgang til administrative funksjoner.
									</p>
								</div>
							</div>
						</RadioGroup>

						<div className="grid gap-2">
							<SubmitButton
								className="w-full"
								text="Endre rolle"
								status={status}
							/>
							<DialogClose asChild>
								<Button type="button" variant="ghost" className="w-full">
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
