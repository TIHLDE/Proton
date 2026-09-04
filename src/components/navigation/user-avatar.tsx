"use client";

import { Loader2, LogOut, Settings, UserRound } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useLogout } from "./logout";

export default function UserAvatar() {
	const { logout, isPending } = useLogout();

	return (
		<DropdownMenu>
			{/* Avataren står inni triggeren, ikke som `render`: en <span> med
			    role="button" mister de native knappesemantikkene. */}
			<DropdownMenuTrigger
				aria-label="Brukermeny"
				className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
			>
				<Avatar>
					<AvatarFallback>
						<UserRound className="h-4 w-4" />
					</AvatarFallback>
				</Avatar>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuItem
					render={
						<Link
							href="/min-oversikt/innstillinger"
							className="flex items-center"
						>
							<Settings className="mr-2 h-4 w-4" />
							Innstillinger
						</Link>
					}
				/>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					disabled={isPending}
					closeOnClick={false}
					onClick={logout}
				>
					{isPending ? <Loader2 className="animate-spin" /> : <LogOut />}
					Logg ut
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
