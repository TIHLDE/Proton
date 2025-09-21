import { MegaphoneIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";

export default function Hero() {
	return (
		<>
			<section className="relative flex min-h-[60vh] w-full max-w-5xl items-center justify-center md:max-w-7xl">
				<div className="mx-auto flex max-w-4xl flex-col items-center justify-center px-4 pt-44 pb-28 text-center">
					<p className="mb-2 text-accent">Møt morgendagens IT-talenter!</p>
					<h1 className="mb-4 font-extrabold text-5xl text-foreground-primary md:text-7xl">
						Samarbeid med TIHLDE
					</h1>

					<p className="mb-8 text-foreground-secondary text-lg">
						Vi tilbyr unike muligheter for bedrifter til å knytte seg til en ny
						generasjon IT-eksperter. Utforsk våre tilbud og bli en del av
						nettverket som inspirerer, engasjerer og rekrutterer!
					</p>
					<Button asChild variant="default" size="default">
						<Link href="/kontakt">
							Meld interesse
							<MegaphoneIcon className="h-6 w-6 stroke-[1.75]" />
						</Link>
					</Button>
				</div>
			</section>
		</>
	);
}
