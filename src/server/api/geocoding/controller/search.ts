import type z from "zod";
import { SearchLocationInputSchema } from "~/schemas";
import { type Controller, authorizedProcedure } from "../../trpc";

export interface LocationSuggestion {
	label: string;
	lat: number;
	lng: number;
}

interface NominatimAddress {
	house_number?: string;
	road?: string;
	postcode?: string;
	city?: string;
	town?: string;
	village?: string;
	municipality?: string;
}

interface NominatimResult {
	name: string;
	display_name: string;
	lat: string;
	lon: string;
	address?: NominatimAddress;
}

// Nominatims display_name er hele adressehierarkiet (gate, bydel, kommune,
// fylke, postnummer, land) - langt og repetitivt å vise i et skjema. Bygger
// heller en kort "Gate 20, 7014 By"-variant fra de strukturerte feltene.
function buildShortLabel(result: NominatimResult): string {
	const address = result.address;
	if (!address) return result.display_name;

	const cityName =
		address.city || address.town || address.village || address.municipality;
	const cityPart = [address.postcode, cityName].filter(Boolean).join(" ");

	const streetPart = address.road
		? [address.road, address.house_number].filter(Boolean).join(" ")
		: undefined;

	// Et stedsnavn (stadion, hall, butikk ...) er mer gjenkjennelig enn gata
	// det ligger ved. `name` er tom for rene adresser - huset selv har ikke
	// noe navn - men satt for slike steder.
	const primary = result.name || streetPart;

	const parts = [primary, cityPart].filter(Boolean);
	return parts.length > 0 ? parts.join(", ") : result.display_name;
}

const handler: Controller<
	z.infer<typeof SearchLocationInputSchema>,
	LocationSuggestion[]
> = async ({ input }) => {
	const url = new URL("https://nominatim.openstreetmap.org/search");
	url.searchParams.set("q", input.query);
	url.searchParams.set("format", "jsonv2");
	url.searchParams.set("addressdetails", "1");
	url.searchParams.set("limit", "5");
	url.searchParams.set("accept-language", "nb,no,en");

	const response = await fetch(url, {
		headers: {
			// Nettlesere lar oss ikke sette en egen User-Agent fra klienten, og
			// Nominatims bruksvilkår krever en identifiserende en - derfor går
			// søket via serveren i stedet for direkte fra skjemaet.
			"User-Agent": "Proton (TIHLDE Idrett; hs@tihlde.org)",
		},
	});

	if (!response.ok) return [];

	const results = (await response.json()) as NominatimResult[];

	return results.map((result) => ({
		label: buildShortLabel(result),
		lat: Number.parseFloat(result.lat),
		lng: Number.parseFloat(result.lon),
	}));
};

export default authorizedProcedure
	.input(SearchLocationInputSchema)
	.query(handler);
