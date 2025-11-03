"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import FormTextarea from "~/components/form/textarea";
import { Button } from "~/components/ui/button";
import { Form } from "~/components/ui/form";
import { createRegistrationSchema } from "~/schemas";
import { api } from "~/trpc/react";

interface EventRegistrationProps {
	eventId: string;
	initialRegistration?: {
		id: string;
		type: "ATTENDING" | "NOT_ATTENDING";
		comment: string | null;
	} | null;
}

type FormValues = z.infer<typeof createRegistrationSchema>;

export default function EventRegistration({
	eventId,
	initialRegistration,
}: EventRegistrationProps) {
	const [selectedType, setSelectedType] = useState<
		"ATTENDING" | "NOT_ATTENDING" | null
	>(null);
	const router = useRouter();
	const utils = api.useUtils();

	const form = useForm<FormValues>({
		resolver: zodResolver(createRegistrationSchema),
		defaultValues: {
			eventId,
			type: initialRegistration?.type ?? "ATTENDING",
			comment: initialRegistration?.comment ?? "",
		},
	});

	const { mutate: register, isPending } = api.registration.create.useMutation({
		onSuccess: () => {
			utils.registration.getMyRegistration.invalidate({ eventId });
			utils.registration.getCounts.invalidate({ eventId });
			utils.registration.getAllByEvent.invalidate({ eventId });
		},
	});

	const handleRegistration = (type: "ATTENDING" | "NOT_ATTENDING") => {
		setSelectedType(type);
		form.setValue("type", type);

		if (type === "ATTENDING") {
			// Clear comment when attending
			form.setValue("comment", "");
			form.handleSubmit((data) => register(data))();
		}
	};

	const handleNotAttendingSubmit = form.handleSubmit((data) => {
		register(data, {
			onSuccess: () => {
				// Close the comment field after successful submission
				setSelectedType(null);
			},
		});
	});

	return (
		<div className="space-y-4">
			<div className="flex gap-2">
				<Button
					onClick={() => handleRegistration("ATTENDING")}
					disabled={isPending}
					variant={
						(selectedType ?? initialRegistration?.type) === "ATTENDING"
							? "default"
							: "outline"
					}
					className="flex-1"
					type="button"
				>
					<Check className="h-4 w-4" />
					Kommer
				</Button>
				<Button
					onClick={() => handleRegistration("NOT_ATTENDING")}
					disabled={isPending}
					variant={
						(selectedType ?? initialRegistration?.type) === "NOT_ATTENDING"
							? "default"
							: "outline"
					}
					className="flex-1"
					type="button"
				>
					<X className="h-4 w-4" />
					Kommer ikke
				</Button>
			</div>

			{selectedType === "NOT_ATTENDING" && (
				<Form {...form}>
					<form onSubmit={handleNotAttendingSubmit} className="space-y-4">
						<FormTextarea
							form={form}
							name="comment"
							label="Begrunnelse"
							placeholder="Hvorfor kan du ikke komme?"
							description="Vennligst gi en kort begrunnelse for hvorfor du ikke kan delta."
							maxLength={500}
						/>
						<Button type="submit" disabled={isPending} className="w-full">
							Lagre svar
						</Button>
					</form>
				</Form>
			)}
		</div>
	);
}
