"use client";

import { useDroppable } from "@dnd-kit/core";

import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { useCalendarDnd } from "~/components/event-calendar";
import { cn } from "~/lib/utils";

interface DroppableCellProps {
	id: string;
	date: Date;
	time?: number; // For week/day views, represents hours (e.g., 9.25 for 9:15)
	children?: React.ReactNode;
	className?: string;
	onClick?: () => void;
}

export function DroppableCell({
	id,
	date,
	time,
	children,
	className,
	onClick,
}: DroppableCellProps) {
	const { activeEvent } = useCalendarDnd();

	const { setNodeRef, isOver } = useDroppable({
		id,
		data: {
			date,
			time,
		},
	});

	// Format time for display in tooltip (only for debugging)
	const formattedTime =
		time !== undefined
			? (() => {
					const hours = Math.floor(time);
					const minutes = Math.round((time - hours) * 60);
					const d = new Date(date);
					d.setHours(hours, minutes, 0, 0);
					return format(d, "HH:mm", { locale: nb });
				})()
			: null;

	return (
		<div
			ref={setNodeRef}
			onClick={onClick}
			className={cn(
				"flex h-full flex-col overflow-hidden px-0.5 py-1 data-dragging:bg-accent sm:px-1",
				className,
			)}
			title={formattedTime ? `${formattedTime}` : undefined}
			data-dragging={isOver && activeEvent ? true : undefined}
		>
			{children}
		</div>
	);
}
