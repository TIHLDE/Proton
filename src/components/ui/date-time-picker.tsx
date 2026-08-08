"use client";

import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { CalendarIcon, X } from "lucide-react";
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
	clearable?: boolean;
	minDate?: Date;
	maxDate?: Date;
	className?: string;
}

export function DateTimePicker({
	value,
	onChange,
	placeholder = "Velg dato og tid",
	disabled,
	clearable,
	minDate,
	maxDate,
	className,
}: DateTimePickerProps) {
	const [open, setOpen] = React.useState(false);
	const [localTime, setLocalTime] = React.useState(
		value ? format(value, "HH:mm") : "00:00",
	);

	React.useEffect(() => {
		if (value) setLocalTime(format(value, "HH:mm"));
	}, [value]);

	const handleDaySelect = (day: Date | undefined) => {
		if (!day) {
			onChange(undefined);
			setOpen(false);
			return;
		}
		const [hours, minutes] = localTime.split(":").map(Number);
		const newDate = new Date(day);
		newDate.setHours(hours ?? 0, minutes ?? 0, 0, 0);
		onChange(newDate);
		setOpen(false);
	};

	const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const timeStr = e.target.value;
		setLocalTime(timeStr);
		if (!timeStr || !value) return;
		const [hours, minutes] = timeStr.split(":").map(Number);
		const newDate = new Date(value);
		newDate.setHours(hours ?? 0, minutes ?? 0, 0, 0);
		onChange(newDate);
	};

	const minTime = React.useMemo(() => {
		if (!minDate || !value) return undefined;
		const valueDay = new Date(value).setHours(0, 0, 0, 0);
		const minDay = new Date(minDate).setHours(0, 0, 0, 0);
		if (valueDay === minDay) return format(minDate, "HH:mm");
		return undefined;
	}, [minDate, value]);

	return (
		<div className={cn("flex flex-col gap-1.5", className)}>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						type="button"
						disabled={disabled}
						className={cn(
							"w-full justify-start bg-card text-left font-normal",
							!value && "text-muted-foreground",
						)}
					>
						<CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
						{value
							? format(value, "d. MMMM yyyy", { locale: nb })
							: placeholder}
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
										const d = new Date(day);
										d.setHours(0, 0, 0, 0);
										if (minDate) {
											const min = new Date(minDate);
											min.setHours(0, 0, 0, 0);
											if (d < min) return true;
										}
										if (maxDate) {
											const max = new Date(maxDate);
											max.setHours(0, 0, 0, 0);
											if (d > max) return true;
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

			<div className="flex items-center gap-1.5">
				<Input
					type="time"
					value={localTime}
					min={minTime}
					onChange={handleTimeChange}
					disabled={disabled}
					className="flex-1 bg-card"
				/>
				{clearable && value && (
					<Button
						type="button"
						variant="ghost"
						size="icon"
						className="h-9 w-9 shrink-0"
						disabled={disabled}
						onClick={() => onChange(undefined)}
					>
						<X className="h-4 w-4" />
					</Button>
				)}
			</div>
		</div>
	);
}
