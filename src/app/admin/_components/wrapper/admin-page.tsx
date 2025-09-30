import { cn } from "~/lib/utils";

interface PageWrapperProps {
	children: React.ReactNode;
	className?: string;
	id?: string;
}

export default function AdminPageWrapper({
	children,
	className,
	id,
}: PageWrapperProps) {
	return (
		<div className={cn("min-h-screen space-y-4 pt-8 pb-20", className)} id={id}>
			{children}
		</div>
	);
}
