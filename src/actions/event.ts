"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createEvent, deleteEvent, updateEvent } from "~/services/event";

interface EventActionResponse<T = unknown> {
  fieldError?: Partial<Record<keyof T, string | undefined>>;
  formError?: string;
  success?: boolean;
}

const CreateEventSchema = z.object({
  teamId: z.string(),
  name: z.string().min(1, "Navn er påkrevd"),
  datetime: z.string().transform((val) => new Date(val)),
  type: z.enum(["training", "match", "social"], {
    required_error: "Type er påkrevd",
  }),
  isPublic: z.boolean().default(false),
  location: z.string().optional().transform(val => val && val.trim() ? val : undefined),
  note: z.string().optional().transform(val => val && val.trim() ? val : undefined),
});

const UpdateEventSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Navn er påkrevd"),
  datetime: z.string().transform((val) => new Date(val)),
  type: z.enum(["training", "match", "social"], {
    required_error: "Type er påkrevd",
  }),
  isPublic: z.boolean(),
  location: z.string().optional().transform(val => val && val.trim() ? val : undefined),
  note: z.string().optional().transform(val => val && val.trim() ? val : undefined),
});

export async function createEventAction(
  formData: FormData,
): Promise<EventActionResponse<z.infer<typeof CreateEventSchema>>> {
  try {
    const obj: Record<string, any> = Object.fromEntries(formData.entries());
    
    // Convert checkbox value to boolean
    obj.isPublic = obj.isPublic === "on" || obj.isPublic === "true";
    
    const parsed = CreateEventSchema.safeParse(obj);
    if (!parsed.success) {
      const err = parsed.error.flatten();
      return {
        fieldError: {
          teamId: err.fieldErrors.teamId?.[0],
          name: err.fieldErrors.name?.[0],
          datetime: err.fieldErrors.datetime?.[0],
          type: err.fieldErrors.type?.[0],
          location: err.fieldErrors.location?.[0],
          note: err.fieldErrors.note?.[0],
        },
      };
    }

    const data = parsed.data;

    await createEvent({
      teamId: data.teamId,
      name: data.name,
      datetime: data.datetime,
      type: data.type,
      isPublic: data.isPublic,
      location: data.location,
      note: data.note,
    });

    // Revalidate the admin page to show the new event
    revalidatePath(`/lag/${data.teamId}/admin`);

    return { success: true };
  } catch (error) {
    console.error("Error creating event:", error);
    return {
      formError: "Det oppstod en feil ved opprettelse av arrangementet. Prøv igjen.",
    };
  }
}

export async function updateEventAction(
  formData: FormData,
): Promise<EventActionResponse<z.infer<typeof UpdateEventSchema>>> {
  try {
    const obj: Record<string, any> = Object.fromEntries(formData.entries());
    
    // Convert checkbox value to boolean
    obj.isPublic = obj.isPublic === "on" || obj.isPublic === "true";
    
    const parsed = UpdateEventSchema.safeParse(obj);
    if (!parsed.success) {
      const err = parsed.error.flatten();
      return {
        fieldError: {
          id: err.fieldErrors.id?.[0],
          name: err.fieldErrors.name?.[0],
          datetime: err.fieldErrors.datetime?.[0],
          type: err.fieldErrors.type?.[0],
          location: err.fieldErrors.location?.[0],
          note: err.fieldErrors.note?.[0],
        },
      };
    }

    const data = parsed.data;

    await updateEvent(data.id, {
      name: data.name,
      datetime: data.datetime,
      type: data.type,
      isPublic: data.isPublic,
      location: data.location,
      note: data.note,
    });

    // Revalidate the admin page to show the updated event
    const teamId = formData.get("teamId") as string;
    revalidatePath(`/lag/${teamId}/admin`);

    return { success: true };
  } catch (error) {
    console.error("Error updating event:", error);
    return {
      formError: "Det oppstod en feil ved oppdatering av arrangementet. Prøv igjen.",
    };
  }
}

export async function deleteEventAction(
  eventId: string,
  teamId: string,
): Promise<EventActionResponse> {
  try {
    await deleteEvent(eventId);

    // Revalidate the admin page to remove the deleted event
    revalidatePath(`/lag/${teamId}/admin`);

    return { success: true };
  } catch (error) {
    console.error("Error deleting event:", error);
    return {
      formError: "Det oppstod en feil ved sletting av arrangementet. Prøv igjen.",
    };
  }
}