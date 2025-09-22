"use client";

import { SearchIcon, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Input } from "~/components/ui/input";
import useDebounce from "~/hooks/use-debounce";
import { cn } from "~/lib/utils";

interface SearchInputProps {
	className?: string;
	placeholder?: string;
}

export default function SearchInput({
	className,
	placeholder,
}: SearchInputProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const pathname = usePathname();

	const getDefaultValue = (): string => {
		const searchParam = searchParams.get("search");
		return searchParam ? decodeURIComponent(searchParam) : "";
	};

	const [search, setSearch] = useState<string>(getDefaultValue());
	const debouncedSearch = useDebounce(search, 500);

	const onSearch = () => {
		const params = new URLSearchParams(searchParams.toString());
		params.set("page", "1");
		params.set("search", search);
		router.push(`${pathname}?${params.toString()}`);
	};

	const removeSearch = () => {
		const params = new URLSearchParams(searchParams.toString());
		params.delete("search");
		router.push(`${pathname}?${params.toString()}`);
	};

	useEffect(() => {
		if (debouncedSearch) onSearch();
		else removeSearch();
	}, [debouncedSearch]);

	return (
		<div className={cn("relative", className)}>
			<Input
				type="text"
				className="ps-9"
				placeholder={placeholder || "Søk..."}
				value={search}
				onChange={(e) => setSearch(e.target.value)}
			/>
			<div className="absolute inset-y-0 flex h-full w-10 items-center justify-center">
				{search.length > 0 ? (
					<button
						onClick={() => {
							setSearch("");
							removeSearch();
						}}
					>
						<X className="h-4 w-4 text-bong-gray-600" />
					</button>
				) : (
					<SearchIcon className="h-4 w-4 text-bong-gray-400" />
				)}
			</div>
		</div>
	);
}
