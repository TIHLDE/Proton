import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { cn } from "~/lib/utils";
import { FormDescription, FormField, FormItem, FormLabel } from "../ui/form";
import { Switch } from "../ui/switch";

type FormSwitchProps<TFormValues extends FieldValues> = {
	form: UseFormReturn<TFormValues>;
	name: Path<TFormValues>;
	label: string;
	className?: string;
	description?: string;
};

export const FormSwitch = <TFormValues extends FieldValues>({
	form,
	name,
	label,
	className,
	description,
}: FormSwitchProps<TFormValues>) => {
	return (
		<FormField
			control={form.control}
			name={name}
			render={({ field }) => (
				<FormItem
					className={cn(
						"flex items-center justify-between space-x-12 rounded-lg border p-4",
						className,
					)}
				>
					<div className="space-y-0.5">
						<FormLabel className="text-base">{label}</FormLabel>
						{description && <FormDescription>{description}</FormDescription>}
					</div>

					<Switch checked={field.value} onCheckedChange={field.onChange} />
				</FormItem>
			)}
		/>
	);
};
