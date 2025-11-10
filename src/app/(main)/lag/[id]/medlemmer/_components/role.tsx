"use client";

import type { TeamRole } from "@prisma/client";

interface RoleProps {
	role: TeamRole;
}

export default function Role({ role }: RoleProps) {
	const getRoleName = () => {
		switch (role) {
			case "ADMIN":
				return "Administrator";
			case "SUBADMIN":
				return "Subadministrator";
			default:
				return "Medlem";
		}
	};
	return <span>{getRoleName()}</span>;
}
