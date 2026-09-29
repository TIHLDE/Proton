import type { TeamCategory, TeamRole } from "@prisma/client";

export function getTeamRoleLabel(role: TeamRole): string {
	switch (role) {
		case "ADMIN":
			return "Administrator";
		case "SUBADMIN":
			return "Subadministrator";
		default:
			return "Medlem";
	}
}

// Vinklet 3-stopp gradient, samme oppskrift for hver kategori/type: fargen
// starter og slutter likt, med en mørkere tone i midten. Skiller Pythons fra
// resten av TIHLDEs idrettslag visuelt, uavhengig av arrangementstypen.
const teamCategoryPresentation: Record<
	TeamCategory,
	{ label: string; gradient: string }
> = {
	PYTHONS: {
		label: "Pythons",
		gradient: "linear-gradient(135deg, #8346D7 0%, #452571 50%, #8346D7 100%)",
	},
	TIHLDE: {
		label: "TIHLDE",
		gradient: "linear-gradient(135deg, #005CFF 0%, #20478C 50%, #005CFF 100%)",
	},
};

export const teamCategoryOptions: { value: TeamCategory; label: string }[] = (
	Object.keys(teamCategoryPresentation) as TeamCategory[]
).map((category) => ({
	value: category,
	label: teamCategoryPresentation[category].label,
}));

export function getTeamCategoryLabel(category: TeamCategory): string {
	return (
		teamCategoryPresentation[category]?.label ??
		teamCategoryPresentation.TIHLDE.label
	);
}

export function getTeamCategoryGradient(category: TeamCategory): string {
	return (
		teamCategoryPresentation[category]?.gradient ??
		teamCategoryPresentation.TIHLDE.gradient
	);
}
