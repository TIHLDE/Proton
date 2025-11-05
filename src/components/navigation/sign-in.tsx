"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type z from "zod";
import { login } from "~/actions";
import { authClient } from "~/lib/auth-client";
import { SignInInputSchema } from "~/schemas";
import FormInput from "../form/input";
import TihldeLogo from "../logo";
import { Button } from "../ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";
import { Form } from "../ui/form";

export default function LoginForm() {
	const [open, setOpen] = useState<boolean>(false);
	const [isPending, startTransition] = useTransition();
	const router = useRouter();

	const form = useForm<z.infer<typeof SignInInputSchema>>({
		resolver: zodResolver(SignInInputSchema),
		defaultValues: {
			username: "",
			password: "",
		},
	});

	const onSubmit = async (values: z.infer<typeof SignInInputSchema>) => {
		startTransition(async () => {
			try {
				const formData = new FormData();
				formData.append("username", values.username);
				formData.append("password", values.password);
				const loginResponse = await login(formData);
				if (loginResponse.formError || !loginResponse.userData) {
					toast.error(loginResponse.formError);
					form.reset({
						password: "",
						username: "",
					});
					return;
				}

				if (loginResponse.userData.isNewUser) {
					const { error } = await authClient.signUp.email({
						email: loginResponse.userData.email,
						password: values.password,
						name: loginResponse.userData.fullName,
						username: loginResponse.userData.username,
						isAdmin: false,
					});

					if (error) {
						toast.error(error.message || "Noe gikk galt under innloggingen.");
						return;
					}
				} else {
					const { error } = await authClient.signIn.email({
						password: values.password,
						email: loginResponse.userData.email,
					});

					if (error) {
						toast.error(error.message || "Noe gikk galt under innloggingen.");
						return;
					}
				}

				router.replace("/min-oversikt");
				router.refresh();
			} catch {
				toast.error(
					"Noe gikk galt under innloggingen. Vennligst prøv igjen senere.",
				);
			}
		});
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline">Logg inn</Button>
			</DialogTrigger>
			<DialogContent className="md:max-w-md">
				<div className="mb-4 flex flex-col items-center gap-2">
					<div
						className="flex size-14 shrink-0 items-center justify-center rounded-full border"
						aria-hidden="true"
					>
						<TihldeLogo size="small" className="size-9" />
					</div>
					<DialogHeader>
						<DialogTitle className="sm:text-center">
							Velkommen tilbake
						</DialogTitle>
						<DialogDescription className="sm:text-center">
							Bruk din TIHLDE bruker for å logge inn
						</DialogDescription>
					</DialogHeader>
				</div>

				<Form {...form}>
					<form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
						<FormInput
							form={form}
							name="username"
							required
							label="Brukernavn"
						/>

						<FormInput
							form={form}
							name="password"
							type="password"
							required
							label="Passord"
						/>

						<Button type="submit" className="w-full" disabled={isPending}>
							{isPending ? (
								<Loader2 className="animate-spin" />
							) : (
								<span>Logg inn</span>
							)}
						</Button>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
