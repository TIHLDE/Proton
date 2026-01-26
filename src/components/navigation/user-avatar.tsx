"use client";

import { Settings, UserRound } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import Logout from "./logout";

export default function UserAvatar() {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Avatar className="cursor-pointer">
					<AvatarFallback>
						<UserRound className="h-4 w-4" />
					</AvatarFallback>
				</Avatar>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuItem asChild>
					<Link
						href="/min-oversikt/innstillinger"
						className="flex items-center"
					>
						<Settings className="mr-2 h-4 w-4" />
						Innstillinger
					</Link>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<Logout />
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
