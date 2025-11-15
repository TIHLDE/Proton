"use client";

import { RiCalendarLine, RiDeleteBinLine } from "@remixicon/react";
import { format, isBefore } from "date-fns";
import { nb } from "date-fns/locale";
import { useEffect, useMemo, useState } from "react";

import type { TeamEvent } from "@prisma/client";
import type { EventColor } from "~/components/event-calendar";
import {
	DefaultEndHour,
	DefaultStartHour,
	EndHour,
	StartHour,
} from "~/components/event-calendar/constants";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Checkbox } from "~/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "~/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";

interface EventDialogProps {
	event: TeamEvent | null;
	isOpen: boolean;
	onClose: () => void;
	onSave: (event: TeamEvent) => void;
	onDelete: (eventId: string) => void;
}

export function EventDialog({
	event,
	isOpen,
	onClose,
	onSave,
	onDelete,
}: EventDialogProps) {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [startDate, setStartDate] = useState<Date>(new Date());
	const [endDate, setEndDate] = useState<Date>(new Date());
	const [startTime, setStartTime] = useState(`${DefaultStartHour}:00`);
	const [endTime, setEndTime] = useState(`${DefaultEndHour}:00`);
	const [allDay, setAllDay] = useState(false);
	const [location, setLocation] = useState("");
	const [color, setColor] = useState<EventColor>("sky");
	const [error, setError] = useState<string | null>(null);
	const [startDateOpen, setStartDateOpen] = useState(false);
	const [endDateOpen, setEndDateOpen] = useState(false);

	// Debug log to check what event is being passed
	useEffect(() => {
		console.log("EventDialog received event:", event);
	}, [event]);

	useEffect(() => {
		if (event) {
			setTitle(event.name || "");
			setDescription(event.note || "");

			const start = new Date(event.startAt);
			const end = new Date(event.endAt || event.startAt);

			setStartDate(start);
			setEndDate(end);
			setStartTime(formatTimeForInput(start));
			setEndTime(formatTimeForInput(end));
			setAllDay(false);
			setLocation(event.location || "");
			setColor("sky");
			setError(null); // Reset error when opening dialog
		} else {
			resetForm();
		}
	}, [event]);

	const resetForm = () => {
		setTitle("");
		setDescription("");
		setStartDate(new Date());
		setEndDate(new Date());
		setStartTime(`${DefaultStartHour}:00`);
		setEndTime(`${DefaultEndHour}:00`);
		setAllDay(false);
		setLocation("");
		setColor("sky");
		setError(null);
	};

	const formatTimeForInput = (date: Date) => {
		const hours = date.getHours().toString().padStart(2, "0");
		const minutes = Math.floor(date.getMinutes() / 15) * 15;
		return `${hours}:${minutes.toString().padStart(2, "0")}`;
	};

	// Memoize time options so they're only calculated once
	const timeOptions = useMemo(() => {
		const options = [];
		for (let hour = StartHour; hour <= EndHour; hour++) {
			for (let minute = 0; minute < 60; minute += 15) {
				const formattedHour = hour.toString().padStart(2, "0");
				const formattedMinute = minute.toString().padStart(2, "0");
				const value = `${formattedHour}:${formattedMinute}`;
				// Use a fixed date to avoid unnecessary date object creations
				const date = new Date(2000, 0, 1, hour, minute);
				const label = format(date, "HH:mm", { locale: nb });
				options.push({ value, label });
			}
		}
		return options;
	}, []); // Empty dependency array ensures this only runs once

	const handleSave = () => {
		const start = new Date(startDate);
		const end = new Date(endDate);

		if (!allDay) {
			const [startHours = 0, startMinutes = 0] = startTime
				.split(":")
				.map(Number);
			const [endHours = 0, endMinutes = 0] = endTime.split(":").map(Number);

			if (
				startHours < StartHour ||
				startHours > EndHour ||
				endHours < StartHour ||
				endHours > EndHour
			) {
				setError(`Valgt tid må være mellom ${StartHour}:00 og ${EndHour}:00`);
				return;
			}

			start.setHours(startHours, startMinutes, 0);
			end.setHours(endHours, endMinutes, 0);
		} else {
			start.setHours(0, 0, 0, 0);
			end.setHours(23, 59, 59, 999);
		}

		// Validate that end date is not before start date
		if (isBefore(end, start)) {
			setError("Sluttdato kan ikke være før startdato");
			return;
		}

		// Use generic title if empty
		const eventTitle = title.trim() ? title : "(ingen tittel)";

		// onSave({
		//   id: event?.id || "",
		//   name: eventTitle,
		//   note,
		//   startAt: start,
		//   endAt: end,
		//   location,
		// })
	};

	const handleDelete = () => {
		if (event?.id) {
			onDelete(event.id);
		}
	};

	// Updated color options to match types.ts
	const colorOptions: Array<{
		value: EventColor;
		label: string;
		bgClass: string;
		borderClass: string;
	}> = [
		{
			value: "sky",
			label: "Blå",
			bgClass: "bg-sky-400 data-[state=checked]:bg-sky-400",
			borderClass: "border-sky-400 data-[state=checked]:border-sky-400",
		},
		{
			value: "amber",
			label: "Gul",
			bgClass: "bg-amber-400 data-[state=checked]:bg-amber-400",
			borderClass: "border-amber-400 data-[state=checked]:border-amber-400",
		},
		{
			value: "violet",
			label: "Lilla",
			bgClass: "bg-violet-400 data-[state=checked]:bg-violet-400",
			borderClass: "border-violet-400 data-[state=checked]:border-violet-400",
		},
		{
			value: "rose",
			label: "Rosa",
			bgClass: "bg-rose-400 data-[state=checked]:bg-rose-400",
			borderClass: "border-rose-400 data-[state=checked]:border-rose-400",
		},
		{
			value: "emerald",
			label: "Grønn",
			bgClass: "bg-emerald-400 data-[state=checked]:bg-emerald-400",
			borderClass: "border-emerald-400 data-[state=checked]:border-emerald-400",
		},
		{
			value: "orange",
			label: "Oransje",
			bgClass: "bg-orange-400 data-[state=checked]:bg-orange-400",
			borderClass: "border-orange-400 data-[state=checked]:border-orange-400",
		},
	];

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>
						{event?.id ? "Rediger hendelse" : "Opprett hendelse"}
					</DialogTitle>
					<DialogDescription className="sr-only">
						{event?.id
							? "Rediger detaljer for denne hendelsen"
							: "Legg til en ny hendelse i kalenderen din"}
					</DialogDescription>
				</DialogHeader>
				{error && (
					<div className="rounded-md bg-destructive/15 px-3 py-2 text-destructive text-sm">
						{error}
					</div>
				)}
				<div className="grid gap-4 py-4">
					<div className="*:not-first:mt-1.5">
						<Label htmlFor="title">Tittel</Label>
						<Input
							id="title"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
						/>
					</div>

					<div className="*:not-first:mt-1.5">
						<Label htmlFor="description">Beskrivelse</Label>
						<Textarea
							id="description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							rows={3}
						/>
					</div>

					<div className="flex gap-4">
						<div className="flex-1 *:not-first:mt-1.5">
							<Label htmlFor="start-date">Startdato</Label>
							<Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
								<PopoverTrigger asChild>
									<Button
										id="start-date"
										variant={"outline"}
										className={cn(
											"group w-full justify-between border-input bg-background px-3 font-normal outline-none outline-offset-0 hover:bg-background focus-visible:outline-[3px]",
											!startDate && "text-muted-foreground",
										)}
									>
										<span
											className={cn(
												"truncate",
												!startDate && "text-muted-foreground",
											)}
										>
											{startDate
												? format(startDate, "PPP", { locale: nb })
												: "Velg dato"}
										</span>
										<RiCalendarLine
											size={16}
											className="shrink-0 text-muted-foreground/80"
											aria-hidden="true"
										/>
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-2" align="start">
									<Calendar
										mode="single"
										selected={startDate}
										defaultMonth={startDate}
										onSelect={(date) => {
											if (date) {
												setStartDate(date);
												// If end date is before the new start date, update it to match the start date
												if (isBefore(endDate, date)) {
													setEndDate(date);
												}
												setError(null);
												setStartDateOpen(false);
											}
										}}
									/>
								</PopoverContent>
							</Popover>
						</div>

						{!allDay && (
							<div className="min-w-28 *:not-first:mt-1.5">
								<Label htmlFor="start-time">Starttid</Label>
								<Select value={startTime} onValueChange={setStartTime}>
									<SelectTrigger id="start-time">
										<SelectValue placeholder="Velg tid" />
									</SelectTrigger>
									<SelectContent>
										{timeOptions.map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						)}
					</div>

					<div className="flex gap-4">
						<div className="flex-1 *:not-first:mt-1.5">
							<Label htmlFor="end-date">Sluttdato</Label>
							<Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
								<PopoverTrigger asChild>
									<Button
										id="end-date"
										variant={"outline"}
										className={cn(
											"group w-full justify-between border-input bg-background px-3 font-normal outline-none outline-offset-0 hover:bg-background focus-visible:outline-[3px]",
											!endDate && "text-muted-foreground",
										)}
									>
										<span
											className={cn(
												"truncate",
												!endDate && "text-muted-foreground",
											)}
										>
											{endDate
												? format(endDate, "PPP", { locale: nb })
												: "Velg dato"}
										</span>
										<RiCalendarLine
											size={16}
											className="shrink-0 text-muted-foreground/80"
											aria-hidden="true"
										/>
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-2" align="start">
									<Calendar
										mode="single"
										selected={endDate}
										defaultMonth={endDate}
										disabled={{ before: startDate }}
										onSelect={(date) => {
											if (date) {
												setEndDate(date);
												setError(null);
												setEndDateOpen(false);
											}
										}}
									/>
								</PopoverContent>
							</Popover>
						</div>

						{!allDay && (
							<div className="min-w-28 *:not-first:mt-1.5">
								<Label htmlFor="end-time">Sluttid</Label>
								<Select value={endTime} onValueChange={setEndTime}>
									<SelectTrigger id="end-time">
										<SelectValue placeholder="Velg tid" />
									</SelectTrigger>
									<SelectContent>
										{timeOptions.map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						)}
					</div>

					<div className="flex items-center gap-2">
						<Checkbox
							id="all-day"
							checked={allDay}
							onCheckedChange={(checked) => setAllDay(checked === true)}
						/>
						<Label htmlFor="all-day">Hele dagen</Label>
					</div>

					<div className="*:not-first:mt-1.5">
						<Label htmlFor="location">Sted</Label>
						<Input
							id="location"
							value={location}
							onChange={(e) => setLocation(e.target.value)}
						/>
					</div>
					<fieldset className="space-y-4">
						<legend className="font-medium text-foreground text-sm leading-none">
							Farge
						</legend>
						<RadioGroup
							className="flex gap-1.5"
							defaultValue={colorOptions[0]?.value}
							value={color}
							onValueChange={(value: EventColor) => setColor(value)}
						>
							{colorOptions.map((colorOption) => (
								<RadioGroupItem
									key={colorOption.value}
									id={`color-${colorOption.value}`}
									value={colorOption.value}
									aria-label={colorOption.label}
									className={cn(
										"size-6 shadow-none",
										colorOption.bgClass,
										colorOption.borderClass,
									)}
								/>
							))}
						</RadioGroup>
					</fieldset>
				</div>
				<DialogFooter className="flex-row sm:justify-between">
					{event?.id && (
						<Button
							variant="outline"
							size="icon"
							onClick={handleDelete}
							aria-label="Slett hendelse"
						>
							<RiDeleteBinLine size={16} aria-hidden="true" />
						</Button>
					)}
					<div className="flex flex-1 justify-end gap-2">
						<Button variant="outline" onClick={onClose}>
							Avbryt
						</Button>
						<Button onClick={handleSave}>Lagre</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
