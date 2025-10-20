import type { RegistrationType } from "@prisma/client";
import { db } from "~/server/db";

export const createRegistration = async (
	userId: string,
	eventId: string,
	type: RegistrationType,
	comment?: string,
) => {
	try {
		// Check if registration already exists
		const existing = await db.registration.findUnique({
			where: {
				userId_eventId: {
					userId,
					eventId,
				},
			},
		});

		if (existing) {
			// Update existing registration
			return await db.registration.update({
				where: {
					id: existing.id,
				},
				data: {
					type,
					comment,
				},
			});
		}

		// Create new registration
		return await db.registration.create({
			data: {
				userId,
				eventId,
				type,
				comment,
			},
		});
	} catch (error) {
		console.error("Error creating/updating registration:", error);
		throw new Error("Kunne ikke registrere deltakelse");
	}
};

export const getRegistrationByUserAndEvent = async (
	userId: string,
	eventId: string,
) => {
	try {
		return await db.registration.findUnique({
			where: {
				userId_eventId: {
					userId,
					eventId,
				},
			},
		});
	} catch (error) {
		console.error("Error fetching registration:", error);
		return null;
	}
};

export const getRegistrationsByEvent = async (eventId: string) => {
	try {
		return await db.registration.findMany({
			where: {
				eventId,
			},
			include: {
				user: {
					select: {
						id: true,
						name: true,
						image: true,
					},
				},
			},
			orderBy: {
				createdAt: "asc",
			},
		});
	} catch (error) {
		console.error("Error fetching event registrations:", error);
		return [];
	}
};

export const deleteRegistration = async (id: string, userId: string) => {
	try {
		// Verify the registration belongs to the user
		const registration = await db.registration.findFirst({
			where: {
				id,
				userId,
			},
		});

		if (!registration) {
			throw new Error("Registrering ikke funnet");
		}

		return await db.registration.delete({
			where: {
				id,
			},
		});
	} catch (error) {
		console.error("Error deleting registration:", error);
		throw new Error("Kunne ikke slette registrering");
	}
};

export const getRegistrationCountsByEvent = async (eventId: string) => {
	try {
		const registrations = await db.registration.groupBy({
			by: ["type"],
			where: {
				eventId,
			},
			_count: {
				type: true,
			},
		});

		return {
			attending:
				registrations.find((r) => r.type === "ATTENDING")?._count.type ?? 0,
			notAttending:
				registrations.find((r) => r.type === "NOT_ATTENDING")?._count.type ??
				0,
		};
	} catch (error) {
		console.error("Error fetching registration counts:", error);
		return {
			attending: 0,
			notAttending: 0,
		};
	}
};
