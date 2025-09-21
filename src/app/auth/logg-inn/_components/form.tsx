"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type z from "zod";
import { login } from "~/actions";
import FormInput from "~/components/form/input";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Form } from "~/components/ui/form";
import { cn } from "~/lib/utils";
import { SignInInputSchema } from "~/schemas";

export function LoginForm({
	className,
	...props
}: React.ComponentProps<"div">) {
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
				if (loginResponse.formError) {
					toast.error(loginResponse.formError);
					form.reset({
						password: "",
						username: "",
					});
					return;
				}

				router.refresh();
				router.replace("/min-oversikt");
			} catch {
				toast.error(
					"Noe gikk galt under innloggingen. Vennligst prøv igjen senere.",
				);
			}
		});
	};

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card className="overflow-hidden p-0">
				<CardContent className="grid p-0 md:grid-cols-2">
					<Form {...form}>
						<form className="p-6 md:p-8" onSubmit={form.handleSubmit(onSubmit)}>
							<div className="flex flex-col gap-6">
								<div className="flex flex-col items-center text-center">
									<h1 className="font-bold text-2xl">Velkommen tilbake</h1>
									<p className="text-balance text-muted-foreground">
										Logg inn med din TIHLDE bruker
									</p>
								</div>
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
							</div>
						</form>
					</Form>
					<div className="relative hidden items-center justify-center bg-card md:flex">
						{/* <Image
							src="/images/signin.png"
							alt="Logg inn"
							width={300}
							height={200}
						/> */}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
