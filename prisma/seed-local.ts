// Lokalt, git-ignorert script. Legger en eksempelgruppe med
// eksempelarrangementer på den lokale testbrukeren, uten å røre
// eksisterende data. Kjøres manuelt med:
//
//   pnpm tsx prisma/seed-local.ts
//
// Krever at du har logget inn som "Lokal testbruker" i appen minst én gang
// (se src/components/navigation/sign-in.tsx), slik at brukeren finnes i db.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TEST_USER_EMAIL = "local-test-user@example.com";
const TEAM_NAME = "Eksempellag";
const TEAM_SLUG = "eksempellag";

async function main() {
	const testUser = await prisma.user.findUnique({
		where: { email: TEST_USER_EMAIL },
	});

	if (!testUser) {
		throw new Error(
			`Fant ikke testbrukeren (${TEST_USER_EMAIL}). Logg inn som "Lokal testbruker" i appen én gang først.`,
		);
	}

	const team = await prisma.team.upsert({
		where: { slug: TEAM_SLUG },
		update: {},
		create: {
			name: TEAM_NAME,
			slug: TEAM_SLUG,
		},
	});

	await prisma.teamMember.upsert({
		where: { userId_teamId: { userId: testUser.id, teamId: team.id } },
		update: {},
		create: {
			userId: testUser.id,
			teamId: team.id,
			role: "ADMIN",
		},
	});

	const now = new Date();
	const dayMs = 24 * 60 * 60 * 1000;

	const eventDefs: {
		name: string;
		eventType: "TRAINING" | "MATCH" | "SOCIAL" | "OTHER";
		offsetDays: number;
		durationHours: number;
	}[] = [
		{ name: "Kveldstrening", eventType: "TRAINING", offsetDays: -7, durationHours: 1.5 },
		{ name: "Vennligkamp", eventType: "MATCH", offsetDays: -2, durationHours: 2 },
		{ name: "Morgentrening", eventType: "TRAINING", offsetDays: 3, durationHours: 1.5 },
		{ name: "Lagmiddag", eventType: "SOCIAL", offsetDays: 6, durationHours: 3 },
		{ name: "Hjemmekamp", eventType: "MATCH", offsetDays: 10, durationHours: 2 },
	];

	for (const def of eventDefs) {
		const startAt = new Date(now.getTime() + def.offsetDays * dayMs);
		const endAt = new Date(startAt.getTime() + def.durationHours * 60 * 60 * 1000);
		const registrationDeadline = new Date(startAt.getTime() - dayMs);

		const existing = await prisma.teamEvent.findFirst({
			where: { teamId: team.id, name: def.name },
		});
		if (existing) {
			continue;
		}

		const event = await prisma.teamEvent.create({
			data: {
				teamId: team.id,
				eventType: def.eventType,
				name: def.name,
				startAt,
				endAt,
				location: "Eksempelbanen",
				note: "Dette er et eksempelarrangement, kun for lokal testing.",
				registrationDeadline,
			},
		});

		if (startAt < now) {
			await prisma.registration.upsert({
				where: { userId_eventId: { userId: testUser.id, eventId: event.id } },
				update: {},
				create: {
					userId: testUser.id,
					eventId: event.id,
					type: "ATTENDING",
				},
			});
		}
	}

	console.log(`✅ Eksempelgruppe "${team.name}" (${team.slug}) klar for ${testUser.name}.`);
}

main()
	.catch((e) => {
		console.error("❌ Lokal seed feilet:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
