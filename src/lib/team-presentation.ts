import type { TeamRole } from "@prisma/client";

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
