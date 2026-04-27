/**
 * Formats a Date to a human-readable Norwegian date and time string in the
 * Europe/Oslo timezone. Use this instead of Date#toLocaleString() to ensure
 * correct and consistent timezone handling on the server.
 */
export function formatDateTimeOslo(date: Date): string {
	return new Intl.DateTimeFormat("nb-NO", {
		timeZone: "Europe/Oslo",
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	}).format(date);
}

/**
 * Formats a Date to a human-readable Norwegian date string (no time) in the
 * Europe/Oslo timezone.
 */
export function formatDateOslo(date: Date): string {
	return new Intl.DateTimeFormat("nb-NO", {
		timeZone: "Europe/Oslo",
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	}).format(date);
}
