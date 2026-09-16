interface StatusBadgeProps {
	comment: string | null;
}

export default function StatusBadge({ comment }: StatusBadgeProps) {
	return (
		<div className="space-y-1">
			<span className="inline-flex rounded-full border border-border px-3 py-1 font-medium text-muted-foreground text-xs">
				Inaktiv
			</span>
			{comment && <p className="text-muted-foreground text-xs">{comment}</p>}
		</div>
	);
}
