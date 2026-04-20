"use client";

import {
	CalendarDays,
	Check,
	Copy,
	ExternalLink,
	RefreshCw,
} from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { api } from "~/trpc/react";

export function CalendarSubscribeDialog() {
	const [copied, setCopied] = useState(false);
	const [confirmRegen, setConfirmRegen] = useState(false);

	const { data, refetch } = api.me.calendar.getOrCreateToken.useQuery();
	const regenerate = api.me.calendar.regenerateToken.useMutation({
		onSuccess: () => {
			void refetch();
			setConfirmRegen(false);
		},
	});

	const feedUrl =
		typeof window !== "undefined" && data?.token
			? `${window.location.origin}/api/calendar/${data.token}`
			: "";

	const handleCopy = async () => {
		if (!feedUrl) return;
		await navigator.clipboard.writeText(feedUrl);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const googleCalUrl = feedUrl
		? `https://www.google.com/calendar/render?cid=${encodeURIComponent(feedUrl.replace("https://", "webcal://"))}`
		: "";

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm" className="gap-2">
					<CalendarDays size={16} />
					Abonner på kalender
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>Abonner på kalender</DialogTitle>
					<DialogDescription>
						Legg til dine treninger og kamper i Google Calendar, Apple Calendar
						eller Outlook. Hendelser du har svart «ikke tilstede» på vises ikke.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 pt-2">
					<div className="space-y-2">
						<p className="font-medium text-sm">Abonnementslenke</p>
						<div className="flex gap-2">
							<Input
								readOnly
								value={feedUrl}
								className="font-mono text-xs"
								onClick={(e) => (e.target as HTMLInputElement).select()}
							/>
							<Button
								size="icon"
								variant="outline"
								onClick={handleCopy}
								disabled={!feedUrl}
								title="Kopier lenke"
							>
								{copied ? <Check size={16} /> : <Copy size={16} />}
							</Button>
						</div>
					</div>

					<div className="flex flex-col gap-2">
						<p className="font-medium text-sm">Legg til i kalender</p>
						<Button
							variant="outline"
							className="w-full justify-start gap-2"
							disabled={!googleCalUrl}
							onClick={() => window.open(googleCalUrl, "_blank")}
						>
							<ExternalLink size={16} />
							Legg til i Google Calendar
						</Button>
						<Button
							variant="outline"
							className="w-full justify-start gap-2"
							disabled={!feedUrl}
							onClick={() =>
								window.open(
									feedUrl
										.replace("https://", "webcal://")
										.replace("http://", "webcal://"),
									"_blank",
								)
							}
						>
							<ExternalLink size={16} />
							Legg til i Apple Calendar / Outlook
						</Button>
					</div>

					<div className="border-t pt-2">
						{confirmRegen ? (
							<div className="space-y-2">
								<p className="text-muted-foreground text-sm">
									Er du sikker? Den gamle lenken vil slutte å fungere.
								</p>
								<div className="flex gap-2">
									<Button
										size="sm"
										variant="destructive"
										onClick={() => regenerate.mutate()}
										disabled={regenerate.isPending}
									>
										{regenerate.isPending ? "Genererer..." : "Ja, generer ny"}
									</Button>
									<Button
										size="sm"
										variant="outline"
										onClick={() => setConfirmRegen(false)}
									>
										Avbryt
									</Button>
								</div>
							</div>
						) : (
							<Button
								size="sm"
								variant="ghost"
								className="gap-2 text-muted-foreground"
								onClick={() => setConfirmRegen(true)}
							>
								<RefreshCw size={14} />
								Generer ny lenke
							</Button>
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
