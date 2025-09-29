"use client";

import { Pencil } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import { updateEventAction, deleteEventAction } from "~/actions/event";
import SubmitButton from "~/components/form/submit-button";

const eventSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Navn er påkrevd"),
  datetime: z.date({
    required_error: "Dato og tid er påkrevd",
  }),
  type: z.enum(["training", "match", "social"], {
    required_error: "Type er påkrevd",
  }),
  isPublic: z.boolean(),
  location: z.string().optional(),
  note: z.string().optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

interface EditEventProps {
  event: {
    id: string;
    name: string;
    datetime: Date;
    type: "training" | "match" | "social";
    isPublic: boolean;
    location?: string | null;
    note?: string | null;
  };
  teamId: string;
}

export default function EditEvent({ event, teamId }: EditEventProps) {
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      id: event.id,
      name: event.name,
      datetime: new Date(event.datetime),
      type: event.type,
      isPublic: event.isPublic,
      location: event.location || "",
      note: event.note || "",
    },
  });

  const onSubmit = async (data: EventFormData) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      console.log("Updating event:", data);

      const formData = new FormData();
      formData.append("id", data.id);
      formData.append("teamId", teamId);
      formData.append("name", data.name);
      formData.append("datetime", data.datetime.toISOString());
      formData.append("type", data.type);
      formData.append("isPublic", data.isPublic.toString());
      formData.append("location", data.location || "");
      formData.append("note", data.note || "");

      const result = await updateEventAction(formData);

      if (result.formError) {
        alert(result.formError);
        return;
      }

      if (result.fieldError) {
        Object.entries(result.fieldError).forEach(([field, error]) => {
          if (error) {
            form.setError(field as keyof EventFormData, { message: error });
          }
        });
        return;
      }

      if (result.success) {
        setOpen(false);
      }
    } catch (error) {
      console.error("Error updating event:", error);
      alert(
        "Det oppstod en feil ved oppdatering av arrangementet. Prøv igjen."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onDelete = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      console.log("Deleting event:", event.id);

      const result = await deleteEventAction(event.id, teamId);

      if (result.formError) {
        alert(result.formError);
        return;
      }

      if (result.success) {
        setDeleteOpen(false);
        setOpen(false);
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Det oppstod en feil ved sletting av arrangementet. Prøv igjen.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rediger arrangement</DialogTitle>
          <DialogDescription>
            Endre informasjonen for arrangementet.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Navn</FormLabel>
                  <FormControl>
                    <Input placeholder="Arrangementets navn" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="datetime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dato og tid</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      value={
                        field.value
                          ? format(field.value, "yyyy-MM-dd'T'HH:mm")
                          : ""
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value) {
                          field.onChange(new Date(value));
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Velg type arrangement" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="training">Trening</SelectItem>
                      <SelectItem value="match">Kamp</SelectItem>
                      <SelectItem value="social">Sosialt</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isPublic"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Offentlig</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Skal arrangementet være synlig for alle?
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sted</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Hvor skal arrangementet være?"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notat</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ekstra informasjon om arrangementet"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={isLoading || isDeleting}
                  >
                    Slett arrangement
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Bekreft sletting</DialogTitle>
                    <DialogDescription>
                      Er du sikker på at du vil slette arrangementet "
                      {event.name}"? Denne handlingen kan ikke angres.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex justify-end gap-2 mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDeleteOpen(false)}
                      disabled={isDeleting}
                    >
                      Avbryt
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={onDelete}
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Sletter..." : "Slett arrangement"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <SubmitButton
                status={isLoading ? "pending" : "idle"}
                text="Lagre endringer"
                size="sm"
                className="md:w-auto"
              />
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
