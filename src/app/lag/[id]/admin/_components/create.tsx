"use client";

import { Plus } from "lucide-react";
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
import { createEventAction } from "~/actions/event";

const eventSchema = z.object({
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

interface CreateEventProps {
  teamId: string;
}

export default function CreateEvent({ teamId }: CreateEventProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: "",
      type: undefined,
      isPublic: false,
      location: "",
      note: "",
    },
  });

  const onSubmit = async (data: EventFormData) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      console.log("Creating event:", { ...data, teamId });

      const formData = new FormData();
      formData.append("teamId", teamId);
      formData.append("name", data.name);
      formData.append("datetime", data.datetime.toISOString());
      formData.append("type", data.type);
      formData.append("isPublic", data.isPublic.toString());
      formData.append("location", data.location || "");
      formData.append("note", data.note || "");

      const result = await createEventAction(formData);

      if (result.formError) {
        alert(result.formError);
        return;
      }

      if (result.fieldError) {
        // Handle field errors by setting them in the form
        Object.entries(result.fieldError).forEach(([field, error]) => {
          if (error) {
            form.setError(field as keyof EventFormData, { message: error });
          }
        });
        return;
      }

      if (result.success) {
        setOpen(false);
        form.reset();
        // No need to call router.refresh() as revalidatePath handles it
      }
    } catch (error) {
      console.error("Error creating event:", error);
      alert(
        "Det oppstod en feil ved opprettelse av arrangementet. Prøv igjen."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nytt arrangement
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Opprett nytt arrangement</DialogTitle>
          <DialogDescription>
            Fyll ut skjemaet nedenfor for å opprette et nytt arrangement.
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
                        if (e.target.value) {
                          field.onChange(new Date(e.target.value));
                        }
                      }}
                      min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
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

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Avbryt
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Oppretter..." : "Opprett arrangement"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
