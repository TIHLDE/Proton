"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import * as React from "react";
import {
	Controller,
	type ControllerProps,
	type FieldPath,
	type FieldValues,
	FormProvider,
	useFormContext,
	useFormState,
} from "react-hook-form";

import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "~/components/ui/field";

// Denne fila er *bare* en bro mellom react-hook-form og Photons Field-
// primitiver. Alt visuelt bor i field.tsx, som er kopiert uendret fra
// @tihlde/ui — så et designbytte i Photon slår gjennom her uten at denne
// fila må røres. Kvark bruker @tanstack/react-form og har derfor sin egen
// bro; Field-komponentene vet ikke om noen av delene.

const Form = FormProvider;

type FormFieldContextValue<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
	name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>(
	{} as FormFieldContextValue,
);

const FormField = <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
	...props
}: ControllerProps<TFieldValues, TName>) => {
	return (
		<FormFieldContext.Provider value={{ name: props.name }}>
			<Controller {...props} />
		</FormFieldContext.Provider>
	);
};

const useFormField = () => {
	const fieldContext = React.useContext(FormFieldContext);
	const itemContext = React.useContext(FormItemContext);
	const { getFieldState } = useFormContext();
	const formState = useFormState({ name: fieldContext.name });
	const fieldState = getFieldState(fieldContext.name, formState);

	if (!fieldContext) {
		throw new Error("useFormField should be used within <FormField>");
	}

	const { id } = itemContext;

	return {
		id,
		name: fieldContext.name,
		formItemId: `${id}-form-item`,
		formDescriptionId: `${id}-form-item-description`,
		formMessageId: `${id}-form-item-message`,
		...fieldState,
	};
};

type FormItemContextValue = {
	id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>(
	{} as FormItemContextValue,
);

function FormItem({ ...props }: React.ComponentProps<typeof Field>) {
	const id = React.useId();

	return (
		<FormItemContext.Provider value={{ id }}>
			<Field data-slot="form-item" {...props} />
		</FormItemContext.Provider>
	);
}

function FormLabel({ ...props }: React.ComponentProps<typeof FieldLabel>) {
	const { error, formItemId } = useFormField();

	return (
		<FieldLabel
			data-slot="form-label"
			data-error={!!error}
			className="data-[error=true]:text-destructive"
			htmlFor={formItemId}
			{...props}
		/>
	);
}

// Radix' <Slot> finnes ikke i Base UI. useRender gjør samme jobb: den slår
// props-ene under sammen inn i elementet som sendes som children, i stedet
// for å pakke det inn i en ekstra node.
function FormControl({ children }: { children: React.ReactElement }) {
	const { error, formItemId, formDescriptionId, formMessageId } =
		useFormField();

	return useRender({
		render: children as useRender.RenderProp,
		props: mergeProps(
			{
				"data-slot": "form-control",
				id: formItemId,
				"aria-describedby": error
					? `${formDescriptionId} ${formMessageId}`
					: formDescriptionId,
				"aria-invalid": !!error,
			},
			{},
		),
	});
}

function FormDescription({
	...props
}: React.ComponentProps<typeof FieldDescription>) {
	const { formDescriptionId } = useFormField();

	return (
		<FieldDescription
			data-slot="form-description"
			id={formDescriptionId}
			{...props}
		/>
	);
}

function FormMessage({ ...props }: React.ComponentProps<typeof FieldError>) {
	const { error, formMessageId } = useFormField();
	const body = error ? String(error?.message ?? "") : props.children;

	if (!body) {
		return null;
	}

	return (
		<FieldError data-slot="form-message" id={formMessageId} {...props}>
			{body}
		</FieldError>
	);
}

export {
	useFormField,
	Form,
	FormItem,
	FormLabel,
	FormControl,
	FormDescription,
	FormMessage,
	FormField,
};
