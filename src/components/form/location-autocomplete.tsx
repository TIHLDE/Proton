"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

export interface LocationSelection {
	label: string;
	lat: number;
	lng: number;
}

interface LocationAutocompleteProps {
	value: string;
	onChange: (value: string) => void;
	onSelect: (selection: LocationSelection) => void;
	placeholder?: string;
	id?: string;
}

// Fritekst-søk med forslag mens du skriver, som Google Maps' egen søkeboks -
// laget nettopp for å unngå at et for kort/vagt stedsnavn (f.eks. bare
// gatenummeret) blir tolket ulikt avhengig av hvem som senere ser kartet.
export default function LocationAutocomplete({
	value,
	onChange,
	onSelect,
	placeholder,
	id,
}: LocationAutocompleteProps) {
	const [open, setOpen] = useState(false);
	const [debouncedValue, setDebouncedValue] = useState(value);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const timeout = setTimeout(() => setDebouncedValue(value), 400);
		return () => clearTimeout(timeout);
	}, [value]);

	const { data: suggestions = [] } = api.geocoding.search.useQuery(
		{ query: debouncedValue },
		{ enabled: debouncedValue.trim().length >= 3 },
	);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target as Node)
			) {
				setOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<div ref={containerRef} className="relative">
			<Input
				id={id}
				value={value}
				placeholder={placeholder}
				autoComplete="off"
				onChange={(e) => {
					onChange(e.target.value);
					setOpen(true);
				}}
				onFocus={() => {
					if (suggestions.length > 0) setOpen(true);
				}}
			/>
			{open && suggestions.length > 0 && (
				<div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md">
					{suggestions.map((suggestion) => (
						<button
							key={`${suggestion.lat}-${suggestion.lng}`}
							type="button"
							className={cn(
								"block w-full truncate px-3 py-2 text-left text-sm",
								"hover:bg-accent hover:text-accent-foreground",
							)}
							onClick={() => {
								onChange(suggestion.label);
								onSelect(suggestion);
								setOpen(false);
							}}
						>
							{suggestion.label}
						</button>
					))}
				</div>
			)}
		</div>
	);
}
