"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { H3, P } from "~/components/ui/typography";
import { formatInAppZone } from "~/lib/datetime";
import { type RouterOutputs, api } from "~/trpc/react";

type CourtMember = RouterOutputs["fine"]["getCourt"]["members"][number];
type Rule = "SNITCH" | "GOOD_BOY";

const RULES: Record<
	Rule,
	{
		title: string;
		description: string;
		key: "snitch" | "goodBoy";
		/** Det som vises om hver person ved siden av antallet de får. */
		basis: (member: CourtMember) => string;
	}
> = {
	SNITCH: {
		title: "Snitches don't get stitches",
		description:
			"Alle som ikke har gitt en eneste bot siden sist rettsak, får 8 bøter.",
		key: "snitch",
		basis: (member) => `har gitt ${member.given}`,
	},
	GOOD_BOY: {
		title: "Snill gutt-syndrom",
		description:
			"Alle som har fått under 8 bøter siden sist rettsak, fylles opp til 8.",
		key: "goodBoy",
		basis: (member) => `har fått ${member.received}`,
	},
};

const boter = (quantity: number) =>
	`${quantity} ${quantity === 1 ? "bot" : "bøter"}`;

interface CourtRulesProps {
	teamId: string;
}

/**
 * Rettsak-reglene idKom kjører før hver rettsak. Synlig bare for lagets
 * ledelse. Tallene regnes ut på serveren fra bøtene på tihlde.org.
 */
export default function CourtRules({ teamId }: CourtRulesProps) {
	const { data, isLoading, error } = api.fine.getCourt.useQuery({ teamId });

	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<H3>Rettsak</H3>
				{data ? (
					<LastCourtDate teamId={teamId} since={data.since} />
				) : (
					<P className="text-muted-foreground">
						{isLoading ? "Henter bøtene siden sist rettsak …" : error?.message}
					</P>
				)}
			</div>

			{data && (
				<div className="grid gap-4 md:grid-cols-2">
					{(Object.keys(RULES) as Rule[]).map((rule) => (
						<RuleCard
							key={rule}
							teamId={teamId}
							rule={rule}
							members={data.members}
						/>
					))}
				</div>
			)}
		</div>
	);
}

function LastCourtDate({ teamId, since }: { teamId: string; since: Date }) {
	const utils = api.useUtils();
	const [editing, setEditing] = useState(false);
	const [date, setDate] = useState(formatInAppZone(since, "yyyy-MM-dd"));

	const { mutate: setLastCourtDate, isPending } =
		api.fine.setLastCourtDate.useMutation({
			onSuccess: () => {
				toast.success("Datoen for sist rettsak er lagret.");
				setEditing(false);
				void utils.fine.getCourt.invalidate({ teamId });
			},
			onError: (error) => toast.error(error.message),
		});

	if (!editing) {
		return (
			<div className="flex flex-wrap items-center gap-2">
				<P className="text-muted-foreground">
					Teller bøter fra og med sist rettsak,{" "}
					{formatInAppZone(since, "d. MMMM yyyy")}.
				</P>
				<Button
					variant="link"
					size="sm"
					onClick={() => {
						setDate(formatInAppZone(since, "yyyy-MM-dd"));
						setEditing(true);
					}}
				>
					Endre
				</Button>
			</div>
		);
	}

	return (
		<div className="flex flex-wrap items-end gap-2">
			<div className="space-y-2">
				<Label htmlFor="last-court">Sist rettsak</Label>
				<Input
					id="last-court"
					type="date"
					value={date}
					onChange={(event) => setDate(event.target.value)}
				/>
			</div>
			<Button
				disabled={isPending || date === ""}
				onClick={() => setLastCourtDate({ teamId, date })}
			>
				Lagre
			</Button>
			<Button variant="ghost" onClick={() => setEditing(false)}>
				Avbryt
			</Button>
		</div>
	);
}

function RuleCard({
	teamId,
	rule,
	members,
}: {
	teamId: string;
	rule: Rule;
	members: CourtMember[];
}) {
	const { title, description, key, basis } = RULES[rule];
	const router = useRouter();
	const utils = api.useUtils();
	const [open, setOpen] = useState(false);
	// Hvem som er krysset av bort, som i dialogen for manglende svar.
	const [deselected, setDeselected] = useState<Set<string>>(new Set());

	// Bare de regelen gjelder. De som allerede har fått eller ikke kan få,
	// står likevel i lista, så ledelsen ser hvorfor de slipper.
	const affected = members.filter(
		(member) => member[key] > 0 || member.applied[key] !== null,
	);
	const isEligible = (member: CourtMember) =>
		member[key] > 0 && member.applied[key] === null && !member.skipReason;
	const eligible = affected.filter(isEligible);
	const selected = eligible.filter((member) => !deselected.has(member.userId));
	const count = selected.length;
	const total = selected.reduce((sum, member) => sum + member[key], 0);
	const allSelected = count === eligible.length;

	const { mutate: applyRule, isPending } = api.fine.applyCourtRule.useMutation({
		onSuccess: ({ given, skipped, failed, sentToTihlde }) => {
			if (given.length > 0) {
				toast.success(
					sentToTihlde
						? `${given.length} fikk bøter på tihlde.org.`
						: `${given.length} fikk bøter, men bare lokalt: PHOTON_FINES_ENABLED er av.`,
				);
			}
			if (skipped.length > 0) {
				toast.info(
					`Hoppet over: ${skipped.map((s) => `${s.name} (${s.message})`).join(", ")}`,
				);
			}
			if (failed.length > 0) {
				toast.error(
					`Feilet: ${failed.map((f) => `${f.name} (${f.message})`).join(", ")}`,
				);
			}
			setOpen(false);
			void utils.fine.getCourt.invalidate({ teamId });
			router.refresh();
		},
		onError: (error) => toast.error(error.message),
	});

	const toggle = (userId: string) =>
		setDeselected((previous) => {
			const next = new Set(previous);
			if (next.has(userId)) next.delete(userId);
			else next.add(userId);
			return next;
		});

	const statusText = (member: CourtMember) => {
		const applied = member.applied[key];
		if (applied !== null) return `har fått ${boter(applied)}`;
		if (member.skipReason) return `${member.skipReason}, får ikke`;
		return `får ${boter(member[key])}`;
	};

	return (
		<div className="space-y-4 rounded-lg border bg-card p-4 shadow-sm">
			<div className="space-y-1">
				<p className="font-semibold">{title}</p>
				<p className="text-muted-foreground text-sm">{description}</p>
			</div>
			<p className="text-sm">
				{eligible.length === 0
					? affected.length === 0
						? "Regelen gjelder ingen nå."
						: "Alle regelen gjelder, har fått bøtene sine."
					: `Gjelder ${eligible.length} ${eligible.length === 1 ? "person" : "personer"}.`}
			</p>

			<Dialog
				open={open}
				onOpenChange={(next) => {
					// Dialogen forblir montert, så valgene nullstilles ved åpning.
					if (next) setDeselected(new Set());
					setOpen(next);
				}}
			>
				<DialogTrigger
					render={
						<Button variant="outline" disabled={affected.length === 0}>
							Gå gjennom
						</Button>
					}
				/>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{title}</DialogTitle>
						<DialogDescription>
							{description} De du krysser av, får bøtene i gruppa på tihlde.org,
							der de venter på at botsjefen godkjenner dem. Ingen kan få samme
							regel to ganger for samme rettsak.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-2">
						<div className="flex items-center justify-between gap-2">
							<Label>{`${affected.length} ${affected.length === 1 ? "person" : "personer"}`}</Label>
							{eligible.length > 1 && (
								<Button
									type="button"
									variant="link"
									size="sm"
									onClick={() =>
										setDeselected(
											allSelected
												? new Set(eligible.map((member) => member.userId))
												: new Set(),
										)
									}
								>
									{allSelected ? "Fjern alle" : "Velg alle"}
								</Button>
							)}
						</div>
						<div className="max-h-72 space-y-1 overflow-y-auto rounded-md border p-2">
							{affected.map((member) => {
								const checkboxId = `court-${rule}-${member.userId}`;
								const enabled = isEligible(member);
								return (
									<div
										key={member.userId}
										className="flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-accent"
									>
										<Checkbox
											id={checkboxId}
											checked={enabled && !deselected.has(member.userId)}
											disabled={!enabled}
											onCheckedChange={() => toggle(member.userId)}
										/>
										<Label
											htmlFor={checkboxId}
											className={
												enabled
													? "flex-1 cursor-pointer font-normal"
													: "flex-1 font-normal text-muted-foreground"
											}
										>
											<span className="flex-1">{member.name}</span>
											<span className="text-muted-foreground text-xs">
												{basis(member)} · {statusText(member)}
											</span>
										</Label>
									</div>
								);
							})}
						</div>
					</div>

					<div className="grid gap-2">
						<Button
							disabled={isPending || count === 0}
							onClick={() =>
								applyRule({
									teamId,
									rule,
									userIds: selected.map((member) => member.userId),
								})
							}
						>
							{isPending
								? "Gir bøter …"
								: count === 0
									? "Gi bøter"
									: `Gi ${boter(total)} til ${count} ${count === 1 ? "person" : "personer"}`}
						</Button>
						<DialogClose
							render={
								<Button type="button" variant="ghost">
									Avbryt
								</Button>
							}
						/>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
