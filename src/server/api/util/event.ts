export function isEventPast(event: {
	endAt: Date | null;
	startAt: Date;
}): boolean {
	if (event.endAt) {
		return event.endAt < new Date();
	}
	return event.startAt < new Date();
}
