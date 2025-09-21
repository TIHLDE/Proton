"use client";

import { Loader2 } from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "../ui/button";

interface SubmitButtonProps {
	text: string;
	status: "error" | "idle" | "pending" | "success";
	disabled?: boolean;
	className?: string;
	id?: string;
	variant?: "default" | "outline" | "ghost" | "link" | "destructive";
	size?: "default" | "sm" | "lg" | "icon";
}

export default function SubmitButton({
	text,
	status,
	disabled,
	className,
	id,
	variant,
	size,
}: SubmitButtonProps) {
	return (
		<Button
			id={id}
			type="submit"
			className={cn("w-full", className)}
			disabled={status === "pending" || disabled}
			variant={variant ? variant : "default"}
			size={size}
		>
			{status === "pending" ? (
				<Loader2 className="h-6 w-6 animate-spin" />
			) : (
				<span>{text}</span>
			)}
		</Button>
	);
}
