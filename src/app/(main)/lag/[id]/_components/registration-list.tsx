"use client";

import { Users } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { H3, P } from "~/components/ui/typography";
import { api } from "~/trpc/react";

interface RegistrationListProps {
  eventId: string;
  eventName: string;
}

export default function RegistrationList({
  eventId,
  eventName,
}: RegistrationListProps) {
  const { data: registrations, isLoading } =
    api.registration.getAllByEvent.useQuery({
      eventId,
    });

  const attending = registrations?.filter((r) => r.type === "ATTENDING") ?? [];
  const notAttending =
    registrations?.filter((r) => r.type === "NOT_ATTENDING") ?? [];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-auto p-0">
          <Users className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{eventName}</DialogTitle>
          <DialogDescription>Påmeldingsoversikt</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <H3 className="mb-3 text-green-600">Kommer ({attending.length})</H3>
            {attending.length === 0 ? (
              <P className="text-muted-foreground">Ingen påmeldte ennå</P>
            ) : (
              <div className="space-y-2">
                {attending.map((registration) => (
                  <div
                    key={registration.id}
                    className="flex items-center gap-3 rounded-lg border bg-card p-3"
                  >
                    {registration.user.image && (
                      <img
                        src={registration.user.image}
                        alt={registration.user.name}
                        className="h-8 w-8 rounded-full"
                      />
                    )}
                    <span>{registration.user.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <H3 className="mb-3 text-red-600">
              Kommer ikke ({notAttending.length})
            </H3>
            {notAttending.length === 0 ? (
              <P className="text-muted-foreground">Ingen avmeldinger</P>
            ) : (
              <div className="space-y-2">
                {notAttending.map((registration) => (
                  <div
                    key={registration.id}
                    className="flex items-center gap-3 rounded-lg border bg-card p-3"
                  >
                    {registration.user.image && (
                      <img
                        src={registration.user.image}
                        alt={registration.user.name}
                        className="h-8 w-8 rounded-full"
                      />
                    )}
                    <span>{registration.user.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {isLoading && (
          <div className="py-8 text-center">
            <P className="text-muted-foreground">Laster...</P>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
