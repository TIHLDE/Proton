interface EventLocationMapProps {
	location: string;
	lat?: number | null;
	lng?: number | null;
}

// Googles nøkkelfrie embed-URL - ingen API-nøkkel nødvendig. Med koordinater
// (valgt fra adresseforslagene ved oppretting) peker den nøyaktig, uten å
// gjette - uten dem faller den tilbake til et fritekstsøk på selve
// stedsnavnet, som Google geokoder ut fra hvem som ser på kartet.
export function EventLocationMap({
	location,
	lat,
	lng,
}: EventLocationMapProps) {
	const query =
		lat != null && lng != null ? `${lat},${lng}` : encodeURIComponent(location);

	return (
		<iframe
			title={`Kart over ${location}`}
			src={`https://www.google.com/maps?q=${query}&output=embed`}
			className="h-48 w-full rounded-lg border-0"
			loading="lazy"
			referrerPolicy="no-referrer-when-downgrade"
		/>
	);
}
