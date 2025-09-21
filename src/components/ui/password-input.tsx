"use client";

import { EyeIcon, EyeOffIcon } from "lucide-react";
import { type ComponentProps, forwardRef, useState } from "react";
import { Input } from "./input";

const PasswordInput = forwardRef<HTMLInputElement, ComponentProps<"input">>(
	({ ...props }, ref) => {
		const [isVisible, setIsVisible] = useState<boolean>(false);

		const toggleVisibility = () => setIsVisible((prevState) => !prevState);

		return (
			<div className="relative">
				<Input
					className="pe-9"
					type={isVisible ? "text" : "password"}
					autoComplete="new-password"
					{...props}
					ref={ref}
				/>
				<button
					className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md text-gray-500/80 outline-none transition-[color,box-shadow] hover:text-foreground focus:z-10 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
					type="button"
					onClick={toggleVisibility}
					aria-label={isVisible ? "Hide password" : "Show password"}
					aria-pressed={isVisible}
					aria-controls="password"
				>
					{isVisible ? (
						<EyeOffIcon size={16} aria-hidden="true" />
					) : (
						<EyeIcon size={16} aria-hidden="true" />
					)}
				</button>
			</div>
		);
	},
);

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
