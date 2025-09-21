"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "~/lib/auth";
import { LoginForm } from "./_components/form";

export default async function LoginPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (session) redirect("/");

	return (
		<div>
			<div className="flex flex-col items-center justify-center bg-background px-2 py-6 md:min-h-svh md:p-10">
				<div className="w-full max-w-sm md:max-w-4xl">
					<LoginForm />
				</div>
			</div>
		</div>
	);
}
