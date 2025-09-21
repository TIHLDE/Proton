import Link from "next/link";
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { cn } from "~/lib/utils";
import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../ui/form";
import PasswordInput from "../ui/password-input";

type FormPasswordInputProps<TFormValues extends FieldValues> = {
	form: UseFormReturn<TFormValues>;
	name: Path<TFormValues>;
	label: string;
	description?: string;
	placeholder?: string;
	required?: boolean;
	className?: string;
	disabled?: boolean;
	id?: string;
	forgotPasswordHref?: string;
	autoComplete?: string;
};

const FormPasswordInput = <TFormValues extends FieldValues>({
	form,
	name,
	label,
	description,
	placeholder,
	required,
	className,
	disabled = false,
	id,
	forgotPasswordHref,
	autoComplete,
}: FormPasswordInputProps<TFormValues>) => {
	return (
		<FormField
			control={form.control}
			name={name}
			render={({ field }) => (
				<FormItem className={cn("w-full", className)}>
					<div className="flex items-center justify-between">
						<FormLabel>
							{label} {required && <span className="text-bong-red-600">*</span>}
						</FormLabel>
						{forgotPasswordHref && (
							<Link
								href={forgotPasswordHref}
								className="text-bong-purple-500 text-sm hover:underline"
							>
								Glemt passord?
							</Link>
						)}
					</div>
					<FormControl>
						<PasswordInput
							{...field}
							id={id}
							disabled={disabled}
							placeholder={placeholder}
							autoComplete={autoComplete}
						/>
					</FormControl>
					{description && <FormDescription>{description}</FormDescription>}
					<FormMessage />
				</FormItem>
			)}
		/>
	);
};

export default FormPasswordInput;
