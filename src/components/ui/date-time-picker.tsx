"use client";

import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import * as React from "react";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Input } from "~/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";

interface DateTimePickerProps {
	value?: Date;
	onChange: (date: Date | undefined) => void;
	placeholder?: string;
	disabled?: boolean;
	minDate?: Date;
	maxDate?: Date;
	className?: string;
}

export function DateTimePicker({
	value,
	onChange,
	placeholder = "Velg dato og tid",
	disabled,
	minDate,
	maxDate,
	className,
}: DateTimePickerProps) {
	const [open, setOpen] = React.useState(false);

	const timeValue = value ? format(value, "HH:mm") : "00:00";

	const handleDaySelect = (day: Date | undefined) => {
		if (!day) {
			onChange(undefined);
			return;
		}
		const [hours, minutes] = timeValue.split(":").map(Number);
		const newDate = new Date(day);
		newDate.setHours(hours ?? 0, minutes ?? 0, 0, 0);
		onChange(newDate);
		setOpen(false);
	};

	const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const timeStr = e.target.value;
		if (!timeStr) return;
		const [hours, minutes] = timeStr.split(":").map(Number);
		const base = value ?? new Date();
		const newDate = new Date(base);
		newDate.setHours(hours ?? 0, minutes ?? 0, 0, 0);
		onChange(newDate);
	};

	return (
		<div className={cn("flex gap-2", className)}>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						type="button"
						disabled={disabled}
						className={cn(
							"flex-1 justify-start bg-card text-left font-normal",
							!value && "text-muted-foreground",
						)}
					>
						<CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
						{value ? (
							format(value, "d. MMM yyyy", { locale: nb })
						) : (
							<span>{placeholder}</span>
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="start">
					<Calendar
						mode="single"
						selected={value}
						onSelect={handleDaySelect}
						disabled={
							minDate || maxDate
								? (day) => {
										const dayStart = new Date(day);
										dayStart.setHours(0, 0, 0, 0);
										if (minDate) {
											const minStart = new Date(minDate);
											minStart.setHours(0, 0, 0, 0);
											if (dayStart < minStart) return true;
										}
										if (maxDate) {
											const maxStart = new Date(maxDate);
											maxStart.setHours(0, 0, 0, 0);
											if (dayStart > maxStart) return true;
										}
										return false;
									}
								: undefined
						}
						initialFocus
						locale={nb}
					/>
				</PopoverContent>
			</Popover>
			<Input
				type="time"
				value={timeValue}
				onChange={handleTimeChange}
				disabled={disabled}
				className="w-24 shrink-0 bg-card"
			/>
		</div>
	);
}
