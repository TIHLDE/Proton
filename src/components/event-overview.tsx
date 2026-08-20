"use client";

import type { TeamEvent } from "@prisma/client";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { Users } from "lucide-react";
import type { ReactNode } from "react";
import EventRegistration from "~/app/(main)/lag/[id]/_components/event-registration";
import {
	type AttendanceStatusFilter,
	attendanceStatusOrder,
	getAttendanceStatusLabel,
	getAttendanceStatusTextClassName,
	getEventDateTime,
	getEventTypeBadgeClassName,
	getEventTypeLabel,
} from "~/lib/event-presentation";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

interface EventOverviewProps {
	event: TeamEvent;
	headerActions?: ReactNode;
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
	status,
}: AttendanceSummaryItemProps) {
	const isInteractive = typeof onClick === "function";
	const summaryClassName = cn(
		"flex flex-col items-center gap-1",
		getAttendanceStatusTextClassName(status),
	);

	if (!isInteractive) {
		return (
			<div className={summaryClassName}>
				<Users className="h-4 w-4" />
				<span className="text-xs">{label}</span>
				<span className="font-semibold">{count}</span>
			</div>
		);
	}

	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				summaryClassName,
				"transition-opacity hover:opacity-80 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
			)}
		>
			<Users className="h-4 w-4" />
			<span className="text-xs">{label}</span>
			<span className="font-semibold">{count}</span>
		</button>
	);
}

export function EventOverview({
	event,
	headerActions,
	showAttendanceSummary = false,
	showRegistration = false,
	onAttendanceStatusClick,
	footer,
}: EventOverviewProps) {
	const eventDateTime = getEventDateTime(event);
	const titleClassName = "text-foreground";
	const labelClassName = "text-muted-foreground";
	const valueClassName = "text-foreground";
	const secondaryValueClassName = "text-muted-foreground";
	const sectionBorderClassName = "border-border";

	const { data: registration } = api.registration.getMyRegistration.useQuery(
		{ eventId: event.id },
		{ enabled: showRegistration },
	);

	const { data: counts } = api.registration.getCounts.useQuery(
		{ eventId: event.id },
		{ enabled: showAttendanceSummary },
	);

	const { data: inviteInfo } = api.event.getInviteInfo.useQuery({
		eventId: event.id,
	});

	const invitedGroupNames = inviteInfo?.groups.map((group) => group.name) ?? [];
	const isLockedForMe = inviteInfo ? !inviteInfo.isInvited : false;

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

				{invitedGroupNames.length > 0 && (
					<EventInfoBlock
						label="Åpent for"
						labelClassName={labelClassName}
						valueClassName={valueClassName}
					>
						{invitedGroupNames.join(", ")}
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
					<div className="grid grid-cols-3 gap-4 text-sm">
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
					{isLockedForMe ? (
						<p className={cn("text-sm", secondaryValueClassName)}>
							{invitedGroupNames.length === 1
								? `Bare ${invitedGroupNames[0]} kan melde seg på.`
								: `Bare ${invitedGroupNames.join(", ")} kan melde seg på.`}
						</p>
					) : (
						<EventRegistration
							eventId={event.id}
							initialRegistration={registration}
							registrationDeadline={event.registrationDeadline}
						/>
					)}
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
