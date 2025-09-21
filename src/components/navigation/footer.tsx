import { Facebook, Instagram } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import TihldeLogo from "../logo";

const Footer = () => {
	const attributes = [
		{ id: "email", key: "E-post", value: "hs@tihlde.org" },
		{ id: "orgNumber", key: "Organisasjonsnummer", value: "989 684 183" },
		{ id: "location", key: "Lokasjon", value: "c/o IDI NTNU" },
	];

	const socials = [
		{
			id: "instagram",
			icon: <Instagram size={24} />,
			href: "https://instagram.com/tihlde",
		},
		{
			id: "facebook",
			icon: <Facebook size={24} />,
			href: "https://facebook.com/tihlde",
		},
	];

	return (
		<div className="mx-auto w-full max-w-7xl px-4 py-16 md:px-20 md:py-16">
			<div className="flex w-full flex-col items-center space-y-12 md:flex-row md:items-start md:justify-between md:space-y-0">
				{/* Left side - Tihlde logo with social icons */}
				<div className="flex flex-col items-center space-y-6 md:items-start">
					<Link
						href="/"
						aria-label="Til forsiden"
						className="font-bold text-2xl text-logo"
					>
						<TihldeLogo size="large" className="h-fit w-52" />
					</Link>
					<div className="flex space-x-8">
						{socials.map((social) => (
							<Link
								key={social.id}
								href={social.href}
								target="_blank"
								rel="noopener noreferrer"
								aria-label={social.id}
								className="text-foreground-secondary transition-colors hover:text-foreground-primary"
							>
								{social.icon}
							</Link>
						))}
					</div>
				</div>

				{/* Middle - Contact information */}
				<div className="space-y-4 md:items-start">
					<h3 className="font-semibold text-3xl">Kontakt</h3>
					{attributes.map((attribute) => (
						<div key={attribute.id}>
							<h4 className="text-sm">{attribute.key}</h4>
							<p className="font-semibold">{attribute.value}</p>
						</div>
					))}
				</div>

				{/* Right side - Nito logo */}
				<div className="flex flex-col items-center space-y-4 md:items-start">
					<h3 className="text-center font-semibold text-2xl">Samarbeid</h3>
					{/* Show light logo in light mode, white logo in dark mode */}
					<div className="relative h-[46px] w-[200px]">
						<Image
							src={"/nito_logo_primaer_gronn_dyp.png"}
							alt="NITO Logo light"
							fill
							className="block object-contain dark:hidden"
							sizes="200px"
							priority={false}
						/>
						<Image
							src={"/nito-logo-hvit.png"}
							alt="NITO Logo dark"
							fill
							className="hidden object-contain dark:block"
							sizes="200px"
							priority={false}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Footer;
