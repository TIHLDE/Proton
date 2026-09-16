"use client";

import type { TeamRole } from "@prisma/client";
import { getTeamRoleLabel } from "~/lib/team-presentation";

interface RoleProps {
	role: TeamRole;
}

export default function Role({ role }: RoleProps) {
	return <span>{getTeamRoleLabel(role)}</span>;
}
