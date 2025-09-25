import { Trophy } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";

export default function Hero() {
	return (
		<>
			<section className="relative flex min-h-[60vh] w-full max-w-5xl items-center justify-center md:max-w-7xl">
				<div className="mx-auto flex max-w-4xl flex-col items-center justify-center px-4 pt-20 pb-16 text-center sm:pt-32 sm:pb-20 md:pt-44 md:pb-28">
					<p className="mb-2 text-accent text-sm sm:text-base">
						Bli med på laget!
					</p>
					<h1 className="mb-4 font-extrabold text-3xl text-foreground-primary sm:text-4xl md:text-5xl lg:text-7xl">
						TIHLDE Idrett
					</h1>

					<p className="mb-8 max-w-2xl text-base text-foreground-secondary leading-relaxed sm:text-lg">
						Plattformen for alle TIHLDEs idrettslag og treningsgrupper. Her kan
						du melde deg på aktiviteter, følge med på resultater, og bli en del
						av det sosiale miljøet rundt sport og trening.
					</p>
					<Button
						asChild
						variant="default"
						size="default"
						className="flex items-center gap-2 px-6 py-3"
					>
						<Link href="/lag">
							Utforsk lag
							<Trophy className="h-4 w-4 stroke-[1.75] sm:h-6 sm:w-6" />
						</Link>
					</Button>
				</div>
			</section>
		</>
	);
}
