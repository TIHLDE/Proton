import { CheckCircle2, HelpCircle, XCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import TihldeLogo from "~/components/logo";
import { Button } from "~/components/ui/button";

export const metadata: Metadata = {
	title: "Svar registrert | TIHLDE Idrett",
};

interface BekreftedPageProps {
	searchParams: Promise<{ rsvp?: string; event?: string }>;
}

export default async function BekreftedPage({
	searchParams,
}: BekreftedPageProps) {
	const { rsvp, event: eventName } = await searchParams;

	const isAttending = rsvp === "ATTENDING";
	const isNotAttending = rsvp === "NOT_ATTENDING";

	return (
		<div className="flex min-h-dvh flex-col items-center justify-center gap-10 px-4">
			<TihldeLogo size="small" />

			<div className="flex w-full max-w-xs flex-col items-center gap-6 text-center">
				{isAttending && (
					<CheckCircle2
						className="h-16 w-16 text-green-500"
						strokeWidth={1.5}
					/>
				)}
				{isNotAttending && (
					<XCircle
						className="h-16 w-16 text-foreground-secondary"
						strokeWidth={1.5}
					/>
				)}
				{!isAttending && !isNotAttending && (
					<HelpCircle
						className="h-16 w-16 text-foreground-secondary"
						strokeWidth={1.5}
					/>
				)}

				<div className="space-y-2">
					<h1 className="font-bold text-2xl text-foreground-primary">
						{isAttending && "Du er påmeldt!"}
						{isNotAttending && "Du er avmeldt."}
						{!isAttending && !isNotAttending && "Svar registrert."}
					</h1>
					{eventName && (
						<p className="text-base text-foreground-secondary">{eventName}</p>
					)}
				</div>

				<Button asChild className="w-full">
					<Link href="/">Gå til appen</Link>
				</Button>
			</div>
		</div>
	);
}
