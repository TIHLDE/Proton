import { db } from "~/server/db";

export const getAllEventsByTeamId = async (teamId: string) => {
  try {
    const events = await db.teamEvent.findMany({
      where: {
        teamId: teamId,
      },
      orderBy: {
        startAt: "asc",
      },
    });

    // Transform the data to match what our components expect
    return events.map((event) => ({
      id: event.id,
      name: event.name,
      datetime: event.startAt,
      type: event.eventType as "training" | "match" | "social",
      isPublic: event.isPublic,
      location: event.location,
      note: event.note,
    }));
  } catch (error) {
    console.error("Error fetching events by team ID:", error);
    return [];
  }
};

export const createEvent = async (data: {
  teamId: string;
  name: string;
  datetime: Date;
  type: string;
  isPublic?: boolean;
  location?: string;
  note?: string;
}) => {
  try {
    const event = await db.teamEvent.create({
      data: {
        teamId: data.teamId,
        name: data.name,
        eventType: data.type,
        startAt: data.datetime,
        endAt: data.datetime, // For now, using same time for start and end
        isPublic: data.isPublic ?? false,
        location: data.location ?? null,
        note: data.note ?? null,
      },
    });

    return {
      id: event.id,
      name: event.name,
      datetime: event.startAt,
      type: event.eventType as "training" | "match" | "social",
      isPublic: event.isPublic,
      location: event.location,
      note: event.note,
    };
  } catch (error) {
    console.error("Error creating event:", error);
    throw new Error("Failed to create event");
  }
};

export const updateEvent = async (
  id: string,
  data: {
    name: string;
    datetime: Date;
    type: string;
    isPublic?: boolean;
    location?: string;
    note?: string;
  }
) => {
  try {
    const event = await db.teamEvent.update({
      where: { id },
      data: {
        name: data.name,
        eventType: data.type,
        startAt: data.datetime,
        endAt: data.datetime, // For now, using same time for start and end
        isPublic: data.isPublic ?? false,
        location: data.location ?? null,
        note: data.note ?? null,
      },
    });

    return {
      id: event.id,
      name: event.name,
      datetime: event.startAt,
      type: event.eventType as "training" | "match" | "social",
      isPublic: event.isPublic,
      location: event.location,
      note: event.note,
    };
  } catch (error) {
    console.error("Error updating event:", error);
    throw new Error("Failed to update event");
  }
};

export const deleteEvent = async (id: string) => {
  try {
    await db.teamEvent.delete({
      where: { id },
    });
  } catch (error) {
    console.error("Error deleting event:", error);
    throw new Error("Failed to delete event");
  }
};