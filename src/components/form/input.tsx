"use client";

import type { Dispatch, SetStateAction } from "react";
import type {
	ControllerRenderProps,
	FieldValues,
	Path,
	UseFormReturn,
} from "react-hook-form";
import { cn } from "~/lib/utils";
import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";

type FormInputProps<TFormValues extends FieldValues> = {
	form: UseFormReturn<TFormValues>;
	name: Path<TFormValues>;
	label?: string;
	type?: string;
	description?: string;
	placeholder?: string;
	required?: boolean;
	className?: string;
	disabled?: boolean;
	id?: string;
	autoComplete?: string;
	onChange?: Dispatch<SetStateAction<any>>;
	maxLength?: number;
};

const FormInput = <TFormValues extends FieldValues>({
	form,
	name,
	label,
	type,
	description,
	placeholder,
	required,
	className,
	autoComplete,
	disabled = false,
	id,
	onChange,
	maxLength,
}: FormInputProps<TFormValues>) => {
	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement>,
		field: ControllerRenderProps<TFormValues, Path<TFormValues>>,
	) => {
		let value = e.target.value;

		// Enforce maxLength for text-based inputs
		if (
			maxLength &&
			type !== "number" &&
			type !== "decimal" &&
			type !== "phone"
		) {
			if (value.length > maxLength) {
				value = value.slice(0, maxLength);
			}
		}

		// If onChange is provided, call it with the new value
		if (onChange) {
			onChange(value);
		}

		if (type === "number") {
			// Parse integer value
			const intValue = Number.parseInt(value);
			field.onChange(intValue);
		} else {
			// Handle other types normally
			field.onChange(value);
		}
	};

	const getCurrentLength = (value: any): number => {
		if (typeof value === "string") {
			return value.length;
		}
		if (typeof value === "number") {
			return value.toString().length;
		}
		return 0;
	};

	return (
		<FormField
			control={form.control}
			name={name}
			render={({ field }) => {
				const currentLength = getCurrentLength(field.value);
				const showCounter =
					maxLength &&
					type !== "phone" &&
					type !== "number" &&
					type !== "decimal";

				return (
					<FormItem className={cn("w-full", className)}>
						{label && (
							<FormLabel>
								{label}{" "}
								{required && <span className="text-bong-red-600">*</span>}
							</FormLabel>
						)}
						<FormControl>
							<Input
								id={id}
								disabled={disabled}
								type={type === "decimal" ? "number" : (type ?? "text")}
								{...field}
								placeholder={placeholder}
								onChange={(e) => handleChange(e, field)}
								autoComplete={autoComplete}
							/>
						</FormControl>
						{(description || showCounter) && (
							<div
								className={cn(
									"flex items-center justify-between",
									!description && "justify-end",
								)}
							>
								{description && (
									<FormDescription className="flex-1">
										{description}
									</FormDescription>
								)}
								{showCounter && (
									<span
										className={cn(
											"text-muted-foreground text-sm",
											currentLength >= maxLength && "text-bong-purple-500",
										)}
									>
										{currentLength}/{maxLength}
									</span>
								)}
							</div>
						)}
						<FormMessage />
					</FormItem>
				);
			}}
		/>
	);
};

export default FormInput;
