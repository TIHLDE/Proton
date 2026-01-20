import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helper function to generate random date within a range
function randomDate(start: Date, end: Date): Date {
	return new Date(
		start.getTime() + Math.random() * (end.getTime() - start.getTime()),
	);
}

// Helper function to pick random items from array
function randomItems<T>(arr: T[], count: number): T[] {
	const shuffled = [...arr].sort(() => 0.5 - Math.random());
	return shuffled.slice(0, count);
}

async function main() {
	console.log("🌱 Starting seed...");

	// Clean existing data
	console.log("🧹 Cleaning existing data...");
	await prisma.registration.deleteMany();
	await prisma.teamEvent.deleteMany();
	await prisma.teamMember.deleteMany();
	await prisma.team.deleteMany();
	await prisma.account.deleteMany();
	await prisma.session.deleteMany();
	await prisma.user.deleteMany();

	// Create 100 users
	console.log("👥 Creating 100 users...");
	const users = await Promise.all(
		Array.from({ length: 100 }, async (_, i) => {
			const userId = `user_${i + 1}_${Date.now()}`;
			return prisma.user.create({
				data: {
					id: userId,
					name: `User ${i + 1}`,
					email: `user${i + 1}@example.com`,
					username: `user${i + 1}`,
					emailVerified: true,
					isAdmin: i === 0, // First user is admin
					image: `https://api.dicebear.com/7.x/avatars/svg?seed=${i}`,
				},
			});
		}),
	);
	console.log(`✅ Created ${users.length} users`);

	// Create 5 teams
	console.log("🏆 Creating 5 teams...");
	const teamNames = [
		"Pythons herrer",
		"Pythons damer",
		"Volleyball",
		"Spring",
		"Håndball",
	];

	const teams = await Promise.all(
		teamNames.map((name, i) =>
			prisma.team.create({
				data: {
					name,
					slug: name.toLowerCase().replace(/\s+/g, "-"),
				},
			}),
		),
	);
	console.log(`✅ Created ${teams.length} teams`);

	// Create team memberships
	// Leave 20 users without any team membership
	console.log("👥 Creating team memberships...");
	const usersWithTeams = users.slice(0, 80); // 80 users will have teams, 20 won't
	const roles: ("ADMIN" | "SUBADMIN" | "USER")[] = [
		"ADMIN",
		"SUBADMIN",
		"USER",
	];

	const memberships = await Promise.all(
		teams.flatMap((team, teamIndex) => {
			// Distribute users across teams (each user can be in 1-2 teams)
			const startIdx = teamIndex * 12; // Each team gets ~12-20 members
			const endIdx = Math.min(
				startIdx + 16 + Math.floor(Math.random() * 5),
				usersWithTeams.length,
			);
			const teamUsers = usersWithTeams.slice(startIdx, endIdx);

			return teamUsers.map((user, userIndex) => {
				// First user in team is ADMIN, second is SUBADMIN, rest are USER
				let role: "ADMIN" | "SUBADMIN" | "USER";
				if (userIndex === 0) {
					role = "ADMIN";
				} else if (userIndex === 1 && teamUsers.length > 1) {
					role = "SUBADMIN";
				} else {
					role = "USER";
				}

				return prisma.teamMember.create({
					data: {
						userId: user.id,
						teamId: team.id,
						role,
					},
				});
			});
		}),
	);
	console.log(`✅ Created ${memberships.length} team memberships`);

	// Create 50 team events (from 1 year ago to 1 year ahead)
	console.log("📅 Creating 50 team events...");
	const now = new Date();
	const oneYearAgo = new Date(
		now.getFullYear() - 1,
		now.getMonth(),
		now.getDate(),
	);
	const oneYearAhead = new Date(
		now.getFullYear() + 1,
		now.getMonth(),
		now.getDate(),
	);

	const eventTypes: ("TRAINING" | "MATCH" | "SOCIAL" | "OTHER")[] = [
		"TRAINING",
		"MATCH",
		"SOCIAL",
		"OTHER",
	];

	const eventNamesByType: Record<
		"TRAINING" | "MATCH" | "SOCIAL" | "OTHER",
		string[]
	> = {
		TRAINING: [
			"Morgentrening",
			"Kveldstrening",
			"Teknisk trening",
			"Taktikksesjon",
			"Fitnestrening",
		],
		MATCH: [
			"Hjemmekamp",
			"Bortkamp",
			"Turneringskamp",
			"Vennligkamp",
			"Mestershipskamp",
		],
		SOCIAL: [
			"Lagmiddag",
			"Lagbygging",
			"Sosial samling",
			"Pizzakveld",
			"Lagturer",
		],
		OTHER: [
			"Lagmøte",
			"Strategisesjon",
			"Fotodag",
			"Utstyrskontroll",
			"Sesongåpning",
		],
	};

	const events = await Promise.all(
		Array.from({ length: 50 }, async (_, i) => {
			const team = teams[i % teams.length]; // Distribute events across teams
			const eventType =
				eventTypes[Math.floor(Math.random() * eventTypes.length)]!;
			const startAt = randomDate(oneYearAgo, oneYearAhead);
			const endAt = new Date(
				startAt.getTime() + (1.5 + Math.random() * 2) * 60 * 60 * 1000,
			); // 1.5-3.5 hours
			const registrationDeadline = new Date(
				startAt.getTime() - 24 * 60 * 60 * 1000,
			); // 24h before event

			const eventNames = eventNamesByType[eventType];
			const baseName =
				eventNames[Math.floor(Math.random() * eventNames.length)];

			return prisma.teamEvent.create({
				data: {
					teamId: team!.id,
					eventType,
					name: `${baseName} #${i + 1}`,
					startAt,
					endAt,
					location: `Sted ${Math.floor(Math.random() * 10) + 1}`,
					note: "Dette er en beskrivelse av arrangementet.",
					registrationDeadline,
				},
			});
		}),
	);
	console.log(`✅ Created ${events.length} team events`);

	// Create registrations (only for users who are members of the team)
	console.log("📝 Creating registrations...");
	const registrations = [];

	for (const event of events) {
		// Get all team members for this event's team
		const teamMembers = await prisma.teamMember.findMany({
			where: { teamId: event.teamId },
		});

		// Randomly select 40-80% of team members to register
		const participationRate = 0.4 + Math.random() * 0.4;
		const registeredMembers = randomItems(
			teamMembers,
			Math.floor(teamMembers.length * participationRate),
		);

		for (const member of registeredMembers) {
			// 80% attending, 20% not attending
			const type = Math.random() < 0.8 ? "ATTENDING" : "NOT_ATTENDING";

			try {
				const registration = await prisma.registration.create({
					data: {
						userId: member.userId,
						eventId: event.id,
						type,
						comment:
							"Dette er en kommentar på registreringen min og at jeg ikke kommer.",
					},
				});
				registrations.push(registration);
			} catch (error) {
				// Skip if duplicate
				console.log("Hoppet over duplikat registrering");
			}
		}
	}
	console.log(`✅ Created ${registrations.length} registrations`);

	console.log("🎉 Seed completed successfully!");
	console.log(`
📊 Summary:
  - Users: ${users.length} (${usersWithTeams.length} with teams, ${users.length - usersWithTeams.length} without teams)
  - Teams: ${teams.length}
  - Team Memberships: ${memberships.length}
  - Team Events: ${events.length}
  - Registrations: ${registrations.length}
  `);
}

main()
	.catch((e) => {
		console.error("❌ Seed failed:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
