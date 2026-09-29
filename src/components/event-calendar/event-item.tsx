"use client";

import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { differenceInMinutes, format, getMinutes, isPast } from "date-fns";
import {
	CalendarIcon,
	CheckCircle2,
	HelpCircle,
	MapPinIcon,
	XCircle,
} from "lucide-react";
import { useMemo } from "react";

import type { TeamEvent } from "@prisma/client";
import { nb } from "date-fns/locale";
import {
	type TeamSummary,
	getBorderRadiusClasses,
} from "~/components/event-calendar";
import {
	getEventTypeAccentColor,
	getEventTypeEmoji,
	getEventTypeGradient,
	getEventTypeLabel,
	getEventTypeTintedBackground,
} from "~/lib/event-presentation";
import { getTeamCategoryGradient } from "~/lib/team-presentation";
import { cn } from "~/lib/utils";
import type { RegistrationCounts } from "~/services/registration";

// Using date-fns format with custom formatting:
// 'h' - hours (1-12)
// 'a' - am/pm
// ':mm' - minutes with leading zero (only if the token 'mm' is present)
const formatTimeWithOptionalMinutes = (date: Date) => {
	return format(date, "HH:mm", { locale: nb });
};

interface EventWrapperProps {
	event: TeamEvent;
	isFirstDay?: boolean;
	isLastDay?: boolean;
	isDragging?: boolean;
	onClick?: (e: React.MouseEvent) => void;
	className?: string;
	children: React.ReactNode;
	currentTime?: Date;
	dndListeners?: SyntheticListenerMap;
	dndAttributes?: DraggableAttributes;
	onMouseDown?: (e: React.MouseEvent) => void;
	onTouchStart?: (e: React.TouchEvent) => void;
}

// Shared wrapper component for event styling
function EventWrapper({
	event,
	isFirstDay = true,
	isLastDay = true,
	isDragging,
	onClick,
	className,
	children,
	currentTime,
	dndListeners,
	dndAttributes,
	onMouseDown,
	onTouchStart,
}: EventWrapperProps) {
	// Always use the currentTime (if provided) to determine if the event is in the past
	const displayEnd = currentTime
		? new Date(
				new Date(currentTime).getTime() +
					(new Date(event.endAt || event.startAt).getTime() -
						new Date(event.startAt).getTime()),
			)
		: new Date(event.endAt || event.startAt);

	const isEventInPast = isPast(displayEnd);

	return (
		<button
			className={cn(
				"flex h-full w-full cursor-pointer select-none overflow-hidden border-l-2 px-1 text-left font-medium outline-none backdrop-blur-md transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 data-dragging:cursor-grabbing data-past-event:line-through data-dragging:shadow-lg sm:px-2",
				getBorderRadiusClasses(isFirstDay, isLastDay),
				className,
			)}
			style={{
				backgroundColor: getEventTypeTintedBackground(event.eventType, 0.16),
				borderLeftColor: getEventTypeAccentColor(event.eventType),
			}}
			data-dragging={isDragging || undefined}
			data-past-event={isEventInPast || undefined}
			onClick={onClick}
			onMouseDown={onMouseDown}
			onTouchStart={onTouchStart}
			{...dndListeners}
			{...dndAttributes}
		>
			{children}
		</button>
	);
}

// Delt mellom agendaen og de romslige uke-/dagblokkene, så oppmøtetallene
// ser like ut uansett hvor de dukker opp.
function RegistrationCountBadges({
	counts,
	accentColor,
}: {
	counts: RegistrationCounts;
	accentColor: string;
}) {
	return (
		<div
			className="flex items-center gap-2 font-medium text-[11px]"
			style={{ color: accentColor }}
		>
			<span className="flex items-center gap-0.5" title="Kommer">
				<CheckCircle2 className="size-3.5" aria-hidden="true" />
				{counts.attending}
			</span>
			<span className="flex items-center gap-0.5 opacity-60" title="Ikke svart">
				<HelpCircle className="size-3.5" aria-hidden="true" />
				{counts.notResponded}
			</span>
			<span
				className="flex items-center gap-0.5 opacity-60"
				title="Kommer ikke"
			>
				<XCircle className="size-3.5" aria-hidden="true" />
				{counts.notAttending}
			</span>
		</div>
	);
}

interface EventItemProps {
	event: TeamEvent & {
		team?: TeamSummary;
		registrationCounts?: RegistrationCounts;
	};
	view: "month" | "week" | "day" | "agenda";
	isDragging?: boolean;
	onClick?: (e: React.MouseEvent) => void;
	showTime?: boolean;
	height?: number;
	currentTime?: Date; // For updating time during drag
	isFirstDay?: boolean;
	isLastDay?: boolean;
	children?: React.ReactNode;
	className?: string;
	dndListeners?: SyntheticListenerMap;
	dndAttributes?: DraggableAttributes;
	onMouseDown?: (e: React.MouseEvent) => void;
	onTouchStart?: (e: React.TouchEvent) => void;
}

export function EventItem({
	event,
	view,
	isDragging,
	onClick,
	showTime,
	height,
	currentTime,
	isFirstDay = true,
	isLastDay = true,
	children,
	className,
	dndListeners,
	dndAttributes,
	onMouseDown,
	onTouchStart,
}: EventItemProps) {
	// Use the provided currentTime (for dragging) or the event's actual time
	const displayStart = useMemo(() => {
		return currentTime || new Date(event.startAt);
	}, [currentTime, event.startAt]);

	const displayEnd = useMemo(() => {
		return currentTime
			? new Date(
					new Date(currentTime).getTime() +
						(new Date(event.endAt || event.startAt).getTime() -
							new Date(event.startAt).getTime()),
				)
			: new Date(event.endAt || event.startAt);
	}, [currentTime, event.startAt, event.endAt]);

	// Calculate event duration in minutes
	const durationMinutes = useMemo(() => {
		return differenceInMinutes(displayEnd, displayStart);
	}, [displayStart, displayEnd]);

	const getEventTime = () => {
		// For short events (less than 45 minutes), only show start time
		if (durationMinutes < 45) {
			return formatTimeWithOptionalMinutes(displayStart);
		}

		// For longer events, show both start and end time
		return `${formatTimeWithOptionalMinutes(displayStart)} - ${formatTimeWithOptionalMinutes(displayEnd)}`;
	};

	if (view === "month") {
		return (
			<EventWrapper
				event={event}
				isFirstDay={isFirstDay}
				isLastDay={isLastDay}
				isDragging={isDragging}
				onClick={onClick}
				className={cn(
					"mt-[var(--event-gap)] h-[var(--event-height)] flex-col items-start justify-center gap-0.5 px-1 py-0.5 text-[7px] leading-tight sm:px-2 sm:py-1 sm:text-xs",
					className,
				)}
				currentTime={currentTime}
				dndListeners={dndListeners}
				dndAttributes={dndAttributes}
				onMouseDown={onMouseDown}
				onTouchStart={onTouchStart}
			>
				{children || (
					<div className="flex w-full flex-col gap-0.5 overflow-hidden">
						<span className="truncate font-normal text-[6px] opacity-70 sm:text-[9px]">
							{formatTimeWithOptionalMinutes(displayStart)}
						</span>
						<span className="line-clamp-2 break-words font-medium text-[7px] leading-tight sm:text-xs">
							{getEventTypeEmoji(event.eventType)} {event.name}
						</span>
					</div>
				)}
			</EventWrapper>
		);
	}

	if (view === "week" || view === "day") {
		// Blokkens høyde er proporsjonal med varigheten (WeekCellsHeight per
		// time), så den avgjør hvor mye detalj som faktisk får plass -
		// tallene er tunet mot 72px/time (se constants.ts).
		const heightPx = height ?? 0;
		const isSpacious = heightPx >= 110;
		const isMedium = heightPx >= 54;
		const accentColor = getEventTypeAccentColor(event.eventType);

		return (
			<EventWrapper
				event={event}
				isFirstDay={isFirstDay}
				isLastDay={isLastDay}
				isDragging={isDragging}
				onClick={onClick}
				className={cn(
					"py-1",
					isMedium ? "flex-col" : "items-center",
					view === "week" ? "text-[10px] sm:text-xs" : "text-xs",
					className,
				)}
				currentTime={currentTime}
				dndListeners={dndListeners}
				dndAttributes={dndAttributes}
				onMouseDown={onMouseDown}
				onTouchStart={onTouchStart}
			>
				{isSpacious ? (
					<>
						{event.team && (
							<div className="truncate text-[10px] italic opacity-70">
								{event.team.emoji && <span>{event.team.emoji} </span>}
								{event.team.name}
							</div>
						)}
						<div className="truncate font-medium">
							{getEventTypeEmoji(event.eventType)} {event.name}
						</div>
						{showTime && (
							<div className="truncate font-normal opacity-70 sm:text-[11px]">
								{getEventTime()}
							</div>
						)}
						{event.location && (
							<div className="flex items-center gap-1 truncate opacity-70 sm:text-[11px]">
								<MapPinIcon className="size-3 shrink-0" aria-hidden="true" />
								{event.location}
							</div>
						)}
						{event.registrationCounts && heightPx >= 150 && (
							<div className="mt-auto pt-0.5">
								<RegistrationCountBadges
									counts={event.registrationCounts}
									accentColor={accentColor}
								/>
							</div>
						)}
					</>
				) : isMedium ? (
					<>
						<div className="truncate font-medium">
							{getEventTypeEmoji(event.eventType)} {event.name}
						</div>
						{showTime && (
							<div className="truncate font-normal opacity-70 sm:text-[11px]">
								{getEventTime()}
							</div>
						)}
					</>
				) : (
					<div className="truncate">
						{event.name}{" "}
						{showTime && (
							<span className="opacity-70">
								{formatTimeWithOptionalMinutes(displayStart)}
							</span>
						)}
					</div>
				)}
			</EventWrapper>
		);
	}

	// Agenda view - eget kortdesign med lagets logo/farge, holdt separat fra
	// måned-/uke-/dagvisningen som deler EventWrapper.
	const gradient = getEventTypeGradient(event.eventType);
	const accentColor = getEventTypeAccentColor(event.eventType);
	const isEventInPast = isPast(new Date(event.endAt || event.startAt));

	return (
		<button
			className={cn(
				"w-full rounded-lg p-px text-left outline-none transition focus-visible:ring-[3px] focus-visible:ring-ring/50",
				isEventInPast && "opacity-60",
				className,
			)}
			style={{ backgroundImage: gradient }}
			data-past-event={isEventInPast || undefined}
			onClick={onClick}
			onMouseDown={onMouseDown}
			onTouchStart={onTouchStart}
			{...dndListeners}
			{...dndAttributes}
		>
			<div className="flex items-start justify-between gap-3 rounded-[calc(var(--radius-lg)-1px)] bg-card p-3 text-card-foreground">
				<div className="min-w-0 flex-1 space-y-1.5">
					{event.team && (
						<div className="truncate text-muted-foreground text-xs italic">
							{event.team.emoji && <span>{event.team.emoji} </span>}
							{event.team.name}
						</div>
					)}
					<div
						className={cn(
							"font-semibold text-base leading-tight",
							isEventInPast && "line-through",
						)}
					>
						{event.name}
					</div>
					<div className="flex items-center gap-1.5 text-muted-foreground text-xs">
						<CalendarIcon className="size-3.5 shrink-0" aria-hidden="true" />
						<span className="capitalize">
							{format(displayStart, "EEEE d. MMM", { locale: nb })}
						</span>
						<span aria-hidden="true">·</span>
						<span>
							{formatTimeWithOptionalMinutes(displayStart)} -{" "}
							{formatTimeWithOptionalMinutes(displayEnd)}
						</span>
					</div>
					{event.location && (
						<div className="flex items-center gap-1.5 text-muted-foreground text-xs">
							<MapPinIcon className="size-3.5 shrink-0" aria-hidden="true" />
							<span className="truncate">{event.location}</span>
						</div>
					)}
					{event.note && (
						<div className="text-xs opacity-90">
							{getEventTypeEmoji(event.eventType)} {event.note}
						</div>
					)}
					<div className="flex items-center justify-between gap-2 pt-0.5">
						<span
							className="inline-flex rounded-full px-2.5 py-0.5 font-medium text-[11px] text-white"
							style={{ backgroundImage: gradient }}
						>
							{getEventTypeLabel(event.eventType)}
						</span>
						{event.registrationCounts && (
							<RegistrationCountBadges
								counts={event.registrationCounts}
								accentColor={accentColor}
							/>
						)}
					</div>
				</div>

				{event.team &&
					(event.team.logoUrl ? (
						// biome-ignore lint/nursery/noImgElement: logoen er en vilkårlig ekstern URL en lagadmin har limt inn, ikke et bilde vi kontrollerer domenet til.
						<img
							src={event.team.logoUrl}
							alt=""
							className="size-14 shrink-0 rounded object-contain"
						/>
					) : (
						<div
							className="flex size-14 shrink-0 items-center justify-center rounded font-semibold text-lg text-white"
							style={{
								backgroundImage: getTeamCategoryGradient(event.team.category),
							}}
							aria-hidden="true"
						>
							{event.team.name.charAt(0)}
						</div>
					))}
			</div>
		</button>
	);
}
