import { cn } from "~/lib/utils";

interface TypographyProps {
	children: React.ReactNode;
	className?: string;
}

export function H1(props: TypographyProps) {
	return (
		<h1
			className={cn(
				"text-balance font-extrabold text-4xl tracking-tight",
				props.className,
			)}
		>
			{props.children}
		</h1>
	);
}

export function H2(props: TypographyProps) {
	return (
		<h2
			className={cn(
				"scroll-m-20 font-semibold text-3xl tracking-tight first:mt-0",
				props.className,
			)}
		>
			{props.children}
		</h2>
	);
}

export function H3(props: TypographyProps) {
	return (
		<h3
			className={cn(
				"scroll-m-20 font-semibold text-2xl tracking-tight",
				props.className,
			)}
		>
			{props.children}
		</h3>
	);
}

export function H4(props: TypographyProps) {
	return (
		<h4
			className={cn(
				"scroll-m-20 font-semibold text-xl tracking-tight",
				props.className,
			)}
		>
			{props.children}
		</h4>
	);
}

export function P(props: TypographyProps) {
	return (
		<p className={cn("leading-7 [&:not(:first-child)]:mt-2", props.className)}>
			{props.children}
		</p>
	);
}
