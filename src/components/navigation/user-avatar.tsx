"use client";

import { UserRound } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
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
					<Logout />
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
