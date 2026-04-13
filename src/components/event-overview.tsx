"use client";

import type { TeamEvent } from "@prisma/client";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { Users } from "lucide-react";
import type { ReactNode } from "react";
import EventRegistration from "~/app/(main)/lag/[id]/_components/event-registration";
import {
	type AttendanceStatusFilter,
	type EventOverviewSurface,
	attendanceStatusOrder,
	getAttendanceStatusAccentClassName,
	getAttendanceStatusLabel,
	getEventDateTime,
	getEventTypeBadgeClassName,
	getEventTypeLabel,
} from "~/lib/event-presentation";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

interface EventOverviewProps {
	event: TeamEvent;
	headerActions?: ReactNode;
	surface?: EventOverviewSurface;
	showAttendanceSummary?: boolean;
	showRegistration?: boolean;
	onAttendanceStatusClick?: (status: AttendanceStatusFilter) => void;
	footer?: ReactNode;
}

interface EventInfoBlockProps {
	label: string;
	children: ReactNode;
	labelClassName: string;
	valueClassName: string;
	className?: string;
}

interface AttendanceSummaryItemProps {
	count: number;
	label: string;
	onClick?: () => void;
	surface: EventOverviewSurface;
	status: AttendanceStatusFilter;
}

function EventInfoBlock({
	label,
	children,
	labelClassName,
	valueClassName,
	className,
}: EventInfoBlockProps) {
	return (
		<div className={cn("space-y-1.5", className)}>
			<p className={cn("font-semibold text-sm", labelClassName)}>{label}</p>
			<div
				className={cn("text-sm leading-relaxed sm:text-base", valueClassName)}
			>
				{children}
			</div>
		</div>
	);
}

function AttendanceSummaryItem({
	count,
	label,
	onClick,
	surface,
	status,
}: AttendanceSummaryItemProps) {
	const isInteractive = typeof onClick === "function";
	const summaryCardClassName =
		surface === "inverse"
			? "border-white/10 bg-white/5 text-white"
			: "border-border bg-muted/30 text-foreground";
	const summaryLabelClassName =
		surface === "inverse" ? "text-white/70" : "text-muted-foreground";

	const content = (
		<>
			<div className="flex items-center gap-2 font-medium text-xs">
				<Users
					className={cn(
						"h-3.5 w-3.5",
						getAttendanceStatusAccentClassName(status, surface),
					)}
				/>
				<span className={summaryLabelClassName}>{label}</span>
			</div>
			<p className="mt-2 font-semibold text-2xl leading-none">{count}</p>
		</>
	);

	if (!isInteractive) {
		return (
			<div className={cn("rounded-lg border p-3", summaryCardClassName)}>
				{content}
			</div>
		);
	}

	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"rounded-lg border p-3 text-left transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
				surface === "inverse" ? "hover:bg-white/10" : "hover:bg-muted/50",
				summaryCardClassName,
			)}
		>
			{content}
		</button>
	);
}

export function EventOverview({
	event,
	headerActions,
	surface = "default",
	showAttendanceSummary = false,
	showRegistration = false,
	onAttendanceStatusClick,
	footer,
}: EventOverviewProps) {
	const eventDateTime = getEventDateTime(event);
	const titleClassName =
		surface === "inverse" ? "text-white" : "text-foreground";
	const labelClassName =
		surface === "inverse" ? "text-white/70" : "text-muted-foreground";
	const valueClassName =
		surface === "inverse" ? "text-white" : "text-foreground";
	const secondaryValueClassName =
		surface === "inverse" ? "text-white/80" : "text-muted-foreground";
	const sectionBorderClassName =
		surface === "inverse" ? "border-white/15" : "border-border";

	const { data: registration } = api.registration.getMyRegistration.useQuery(
		{ eventId: event.id },
		{ enabled: showRegistration },
	);

	const { data: counts } = api.registration.getCounts.useQuery(
		{ eventId: event.id },
		{ enabled: showAttendanceSummary },
	);

	return (
		<div className="space-y-6">
			<div className="flex items-start justify-between gap-4">
				<div className="min-w-0 space-y-3">
					<h2
						className={cn(
							"text-balance font-semibold text-2xl tracking-tight sm:text-3xl",
							titleClassName,
						)}
					>
						{event.name}
					</h2>
					<span
						className={cn(
							"inline-flex rounded-full px-3 py-1 font-medium text-sm",
							getEventTypeBadgeClassName(event.eventType),
							event.eventType === "OTHER" ? "" : "text-white",
						)}
					>
						{getEventTypeLabel(event.eventType)}
					</span>
				</div>
				{headerActions && <div className="shrink-0">{headerActions}</div>}
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				<EventInfoBlock
					label="Dato og tid"
					labelClassName={labelClassName}
					valueClassName={valueClassName}
				>
					<p>{eventDateTime.primary}</p>
					<p className={secondaryValueClassName}>{eventDateTime.secondary}</p>
				</EventInfoBlock>

				<EventInfoBlock
					label="Sted"
					labelClassName={labelClassName}
					valueClassName={valueClassName}
				>
					{event.location || "Ikke oppgitt"}
				</EventInfoBlock>

				{event.registrationDeadline && (
					<EventInfoBlock
						label="Påmeldingsfrist"
						labelClassName={labelClassName}
						valueClassName={valueClassName}
					>
						{format(
							new Date(event.registrationDeadline),
							"d. MMMM yyyy 'kl.' HH:mm",
							{
								locale: nb,
							},
						)}
					</EventInfoBlock>
				)}

				{event.note && (
					<EventInfoBlock
						label="Beskrivelse"
						labelClassName={labelClassName}
						valueClassName={valueClassName}
						className="sm:col-span-2"
					>
						<p className="whitespace-pre-wrap">{event.note}</p>
					</EventInfoBlock>
				)}
			</div>

			{showAttendanceSummary && counts && (
				<div className={cn("border-t pt-6", sectionBorderClassName)}>
					<div className="grid grid-cols-3 gap-3">
						{attendanceStatusOrder.map((status) => (
							<AttendanceSummaryItem
								key={status}
								count={counts[status]}
								label={getAttendanceStatusLabel(status)}
								onClick={
									onAttendanceStatusClick
										? () => onAttendanceStatusClick(status)
										: undefined
								}
								surface={surface}
								status={status}
							/>
						))}
					</div>
				</div>
			)}

			{showRegistration && (
				<div className={cn("border-t pt-6", sectionBorderClassName)}>
					<h3 className={cn("mb-4 font-semibold text-lg", titleClassName)}>
						Påmelding
					</h3>
					<EventRegistration
						eventId={event.id}
						initialRegistration={registration}
						registrationDeadline={event.registrationDeadline}
					/>
				</div>
			)}

			{footer && (
				<div className={cn("border-t pt-6", sectionBorderClassName)}>
					{footer}
				</div>
			)}
		</div>
	);
}
