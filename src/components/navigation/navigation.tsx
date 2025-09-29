"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "../ui/button";

interface NavigationProps {
	page: number;
	nextPage: number | null;
	totalPages: number;
	handleNextPage?: () => void;
	handlePrevPage?: () => void;
}

export default function Navigation({
	page,
	nextPage,
	totalPages,
	handleNextPage,
	handlePrevPage,
}: NavigationProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const pathname = usePathname();

	const defaultHandleNextPage = () => {
		if (!nextPage || page === totalPages) return;

		const params = new URLSearchParams(searchParams.toString());
		params.set("page", String(nextPage));
		router.push(`${pathname}?${params.toString()}`);
	};

	const defaultHandlePrevPage = () => {
		if (page <= 1) return;

		const params = new URLSearchParams(searchParams.toString());
		params.set("page", String(page - 1));
		router.push(`${pathname}?${params.toString()}`);
	};

	return (
		<div className="flex items-center space-x-2">
			<Button
				disabled={page <= 1}
				variant="link"
				onClick={handlePrevPage || defaultHandlePrevPage}
			>
				<ChevronLeft className="h-4 w-4" />
				Forrige
			</Button>

			<div>
				<p className="text-bong-gray-500 text-sm">
					Side {page} av {totalPages}
				</p>
			</div>

			<Button
				disabled={!nextPage || page === totalPages}
				variant="link"
				onClick={handleNextPage || defaultHandleNextPage}
			>
				Neste
				<ChevronRight className="h-4 w-4" />
			</Button>
		</div>
	);
}
