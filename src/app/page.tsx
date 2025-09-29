import Image from "next/image";
import TihldeLogo from "~/components/logo";
import Hero from "./_components/hero";

export default function Home() {
	return (
		<div className="relative flex flex-col items-center justify-center">
			<div
				aria-hidden="true"
				className="-z-10 md:-top-80 absolute inset-x-0 top-20 transform-gpu overflow-hidden blur-3xl sm:top-40"
			>
				<div
					style={{
						clipPath:
							"polygon(74.1% 44.1%, 100% 61.6%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
					}}
					className="-translate-x-1/2 relative left-[calc(50%-8rem)] aspect-[1155/678] w-[24rem] rotate-[30deg] bg-gradient-to-tr from-cyan-500 to-indigo-700 opacity-30 sm:left-[calc(50%-11rem)] sm:w-[36.125rem] md:left-[calc(50%-30rem)] md:w-[72.1875rem]"
				/>
			</div>
			<Hero />
			{/* Om TIHLDE Idrett */}
			<section className="h-auto max-w-5xl justify-center px-4 py-8 sm:py-12 md:py-16">
				<div className="grid place-items-center gap-8 md:grid-cols-5 md:gap-8">
					<div className="order-2 md:order-1 md:col-span-2">
						<h2 className="mb-4 text-center font-bold text-2xl text-foreground-primary sm:text-3xl md:text-left">
							Om TIHLDE Idrett
						</h2>
						<p className="mb-4 text-center text-base text-foreground-secondary leading-relaxed sm:text-lg md:text-left">
							TIHLDE Idrett er hjemstedet for alle våre idrettslag og
							treningsgrupper. Vi tilbyr et bredt spekter av aktiviteter for
							studenter som vil holde seg i form, konkurrere, eller bare ha det
							gøy sammen med andre.
						</p>
					</div>
					<div className="order-1 flex items-center justify-center md:order-2 md:col-span-3">
						{/* Sports logo or image */}
						<div className="relative w-full max-w-sm py-4 md:max-w-none">
							<TihldeLogo size="large" className="h-auto w-full" />
						</div>
					</div>
				</div>
			</section>

			<div
				aria-hidden="true"
				className="-z-10 absolute top-80 right-0 transform-gpu overflow-hidden blur-3xl sm:top-96"
			>
				<div
					style={{
						clipPath:
							"polygon(100% 61.6%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
					}}
					className="relative left-[calc(50%-8rem)] aspect-[1155/678] w-[24rem] rotate-[-30deg] bg-gradient-to-tr from-cyan-500 to-indigo-700 opacity-30 sm:left-[calc(50%-11rem)] sm:w-[36.125rem] md:left-[calc(50%-30rem)] md:w-[72.1875rem]"
				/>
			</div>

			{/* Fotball */}
			<section className="h-auto max-w-5xl justify-center px-4 py-8 sm:py-12 md:py-16">
				<div className="grid place-items-center gap-8 md:grid-cols-5">
					<div className="order-2 md:order-2 md:col-span-2">
						<h2 className="mb-4 text-center font-bold text-2xl text-foreground-primary sm:text-3xl md:text-left">
							Fotball
						</h2>
						<p className="mb-4 text-center text-base text-foreground-secondary leading-relaxed sm:text-lg md:text-left">
							TIHLDE Fotball er vårt største og mest aktive idrettslag. Vi har
							både herrelag og damelag som trener regelmessig og deltar i lokale
							turneringer. Perfekt for både nybegynnere og erfarne spillere som
							vil ha det gøy på banen.
						</p>
					</div>
					<div className="order-1 flex items-center justify-center md:order-first md:col-span-3">
						{/* Football image */}
						<div className="relative w-full max-w-sm md:max-w-none">
							<Image
								src="/fotball.jpg"
								alt="TIHLDE Fotball"
								width={603}
								height={398}
								className="h-auto w-full rounded-lg"
							/>
						</div>
					</div>
				</div>
			</section>

			<div
				aria-hidden="true"
				className="-z-10 absolute top-[800px] right-0 transform-gpu overflow-hidden blur-3xl sm:top-[1000px]"
			>
				<div
					style={{
						clipPath:
							"polygon(100% 61.6%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%)",
					}}
					className="relative left-[calc(10%-10rem)] aspect-[1155/678] w-[20rem] rotate-[10deg] bg-gradient-to-tr from-cyan-500 to-indigo-700 opacity-30 sm:left-[calc(10%-16rem)] sm:w-[26.125rem] md:left-[calc(50%-30rem)] md:w-[72.1875rem]"
				/>
			</div>

			<section className="h-auto max-w-5xl justify-center px-4 py-8 sm:py-12 md:py-16">
				<div className="grid place-items-center gap-8 md:grid-cols-5">
					<div className="order-2 md:order-1 md:col-span-2">
						<h2 className="mb-4 text-center font-bold text-2xl text-foreground-primary sm:text-3xl md:text-left">
							Styrketrening
						</h2>
						<p className="mb-4 text-center text-base text-foreground-secondary leading-relaxed sm:text-lg md:text-left">
							Våre styrketreningsgrupper tilbyr organiserte treningsøkter i både
							Sit Gløshaugen og andre lokale treningssentre. Vi har programmer
							for alle nivåer, fra nybegynner til avansert, med fokus på riktig
							teknikk og trygg progresjon.
						</p>
					</div>
					<div className="order-1 flex items-center justify-center md:order-2 md:col-span-3">
						{/* Gym image */}
						<div className="relative w-full max-w-sm md:max-w-none">
							<Image
								src="/styrketrening.jpg"
								alt="Styrketrening"
								width={603}
								height={398}
								className="h-auto w-full rounded-lg"
							/>
						</div>
					</div>
				</div>
			</section>

			<section className="h-auto max-w-5xl justify-center px-4 py-8 sm:py-12 md:py-16">
				<div className="grid place-items-center gap-8 md:grid-cols-5">
					<div className="order-2 md:order-2 md:col-span-2">
						<h2 className="mb-4 text-center font-bold text-2xl text-foreground-primary sm:text-3xl md:text-left">
							Volleyball
						</h2>
						<p className="mb-4 text-center text-base text-foreground-secondary leading-relaxed sm:text-lg md:text-left">
							TIHLDE Volleyball samler både erfarne spillere og nybegynnere til
							morsomme treningsøkter og turneringer. Vi fokuserer på lagsport,
							fair play og det sosiale aspektet ved å være aktiv sammen med
							medstudenter.
						</p>
					</div>
					<div className="order-1 flex items-center justify-center md:order-first md:col-span-3">
						{/* Volleyball image */}
						<div className="relative w-full max-w-sm md:max-w-none">
							<Image
								src="/volleyball.jpg"
								alt="Volleyball"
								width={603}
								height={398}
								className="h-auto w-full rounded-lg"
							/>
						</div>
					</div>
				</div>
			</section>

			<section className="h-auto max-w-5xl justify-center px-4 py-8 sm:py-12 md:py-16">
				<div className="grid place-items-center gap-8 md:grid-cols-5">
					<div className="order-2 md:order-1 md:col-span-2">
						<h2 className="mb-4 text-center font-bold text-2xl text-foreground-primary sm:text-3xl md:text-left">
							Løpegrupper
						</h2>
						<p className="mb-4 text-center text-base text-foreground-secondary leading-relaxed sm:text-lg md:text-left">
							Våre løpegrupper møtes regelmessig for å utforske Trondheims vakre
							løperuter. Vi har grupper for alle nivåer og distanser, fra rolige
							joggeturer til intensive treningsøkter. Perfekt for å holde formen
							ved like og møte nye mennesker.
						</p>
					</div>
					<div className="order-1 flex items-center justify-center md:order-2 md:col-span-3">
						{/* Running image */}
						<div className="relative w-full max-w-sm md:max-w-none">
							<Image
								src="/løping.jpg"
								alt="Løpegrupper"
								width={603}
								height={398}
								className="h-auto w-full rounded-lg"
							/>
						</div>
					</div>
				</div>
			</section>

			<div
				aria-hidden="true"
				className="-z-10 absolute top-2/3 right-0 transform-gpu overflow-hidden blur-3xl"
			>
				<div
					style={{
						clipPath:
							"polygon(100% 61.6%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%)",
					}}
					className="-left-[calc(20%-10rem)] sm:-left-[calc(20%-16rem)] relative aspect-[1155/678] w-[24rem] rotate-[30deg] bg-gradient-to-tr from-cyan-500 to-indigo-700 opacity-30 sm:w-[36.125rem] md:left-[calc(20%-30rem)] md:w-[72.1875rem]"
				/>
			</div>

			{/* Idrettsgrupper */}
			<section
				id="idrettsgrupper"
				className="max-w-5xl px-4 py-8 sm:py-12 md:py-16"
			>
				<h2 className="mb-6 text-center font-bold text-2xl text-foreground-primary sm:text-3xl md:text-left">
					Våre Idrettsgrupper
				</h2>
				<div className="grid gap-6 sm:gap-8 md:grid-cols-2">
					<div className="rounded p-4 text-center md:text-left">
						<h3 className="mb-3 font-semibold text-lg sm:text-xl">
							Lagidretter
						</h3>
						<p className="text-foreground-secondary text-sm sm:text-base">
							Fotball, volleyball, basketball og andre lagidretter hvor teamwork
							og fellesskap står i fokus. Perfekt for de som trives med å spille
							sammen med andre.
						</p>
					</div>
					<div className="rounded p-4 text-center md:text-left">
						<h3 className="mb-3 font-semibold text-lg sm:text-xl">
							Styrke & Kondisjon
						</h3>
						<p className="text-foreground-secondary text-sm sm:text-base">
							Organiserte treningsgrupper for styrketrening, crossfit, spinning
							og andre former for kondisjonstrening. Alle nivåer er velkommen.
						</p>
					</div>
					<div className="p-4 text-center md:text-left">
						<h3 className="mb-3 font-semibold text-lg sm:text-xl">
							Utendørsaktiviteter
						</h3>
						<p className="text-foreground-secondary text-sm sm:text-base">
							Løpegrupper, sykling, klatring og andre utendørsaktiviteter. Ta
							del i Trondheims vakre natur mens du holder deg i form sammen med
							medstudenter.
						</p>
					</div>
					<div className="p-4 text-center md:text-left">
						<h3 className="mb-3 font-semibold text-lg sm:text-xl">
							Sosiale Aktiviteter
						</h3>
						<p className="text-foreground-secondary text-sm sm:text-base">
							Turneringer, idrettsarrangementer og sosiale sammenkomster hvor
							sport og moro kombineres. En perfekt måte å bli kjent med nye
							mennesker på.
						</p>
					</div>
				</div>
			</section>
		</div>
	);
}
