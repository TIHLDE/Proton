import { cn } from "~/lib/utils";

interface PageHeaderProps {
	children: React.ReactNode;
	className?: string;
}

export default function PageHeader({ children, className }: PageHeaderProps) {
	return <h1 className={cn("font-bold text-2xl", className)}>{children}</h1>;
}
