import { TZDate } from "@date-fns/tz";
import { format } from "date-fns";
import { nb } from "date-fns/locale";

/**
 * Alle TIHLDE-arrangementer holdes i Norge, så tid skal alltid presenteres i
 * norsk tid — uavhengig av hvor koden kjører. Serveren i prod står på UTC, og
 * uten dette formaterte server-rendret innhold to timer feil om sommeren.
 * Det flyttet blant annet en styreperiode som starter 1. januar til desember
 * året før.
 */
export const APP_TIME_ZONE = "Europe/Oslo";

/** Samme dato-instans, men lest i norsk tid. */
export function toAppZone(date: Date): TZDate {
	return new TZDate(date, APP_TIME_ZONE);
}

/**
 * «Nå» lest i norsk tid. Brukes der kalenderen trenger dagens dato eller
 * klokkeslett, så «i dag» og nå-linjen følger Norge og ikke maskinen.
 */
export function nowInAppZone(): TZDate {
	return new TZDate(new Date(), APP_TIME_ZONE);
}

/**
 * Bygger et tidspunkt fra tall som allerede er ment som norsk tid. Brukes av
 * skjemaene: taster noen 18:00, skal det bety 18:00 i Norge uansett hvor de
 * sitter.
 */
export function appZoneDate(
	year: number,
	monthIndex: number,
	day: number,
	hour = 0,
	minute = 0,
): TZDate {
	return new TZDate(year, monthIndex, day, hour, minute, APP_TIME_ZONE);
}

/** date-fns-format i norsk tid med norsk locale. */
export function formatInAppZone(date: Date, pattern: string): string {
	return format(toAppZone(date), pattern, { locale: nb });
}

/** «27. august 2026 kl. 00:02» — til e-post og push-varsler. */
export function formatDateTimeLong(date: Date): string {
	return formatInAppZone(date, "d. MMMM yyyy 'kl.' HH:mm");
}

/**
 * Velgerne leverer tilbake en Date i nettleserens tidssone, der felteneie
 * år/måned/dag/time/minutt er det brukeren faktisk valgte. Denne leser de
 * feltene og bygger samme veggklokke-tid i norsk tid, så «18:00» blir 18:00 i
 * Norge uansett hvor den som taster det inn sitter. Sitter man i Norge er
 * dette en no-op.
 */
export function anchorToAppZone(date: Date): TZDate {
	return appZoneDate(
		date.getFullYear(),
		date.getMonth(),
		date.getDate(),
		date.getHours(),
		date.getMinutes(),
	);
}
