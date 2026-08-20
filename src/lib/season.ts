/**
 * Sesonger utledes fra datoer i stedet for å administreres. Skillet går
 * 1. januar og 1. juli, som følger vår- og høstsesongen i studentidretten.
 * Blir det feil for et lag, er neste steg en egen tabell — men da har vi
 * et konkret lag å designe den for.
 */
export type Season = {
	id: string;
	label: string;
	from: Date;
	to: Date;
};

const SPRING_START_MONTH = 0;
const AUTUMN_START_MONTH = 6;

export function getSeasonForDate(date: Date): Season {
	const year = date.getFullYear();
	const isSpring = date.getMonth() < AUTUMN_START_MONTH;

	return isSpring
		? {
				id: `V${year}`,
				label: `Vår ${year}`,
				from: new Date(year, SPRING_START_MONTH, 1),
				to: new Date(year, AUTUMN_START_MONTH, 1),
			}
		: {
				id: `H${year}`,
				label: `Høst ${year}`,
				from: new Date(year, AUTUMN_START_MONTH, 1),
				to: new Date(year + 1, SPRING_START_MONTH, 1),
			};
}

/**
 * Alle sesonger fra den første datoen til i dag, nyeste først. Tar `from`
 * som argument slik at lag uten arrangementer ikke får en tom liste og lag
 * med lang historikk ikke får den avkortet.
 */
export function getSeasons(from: Date, until: Date = new Date()): Season[] {
	const seasons: Season[] = [];
	let cursor = getSeasonForDate(from);

	while (cursor.from <= until) {
		seasons.push(cursor);
		cursor = getSeasonForDate(cursor.to);
	}

	return seasons.reverse();
}

export function findSeason(seasons: Season[], id: string): Season | undefined {
	return seasons.find((season) => season.id === id);
}
