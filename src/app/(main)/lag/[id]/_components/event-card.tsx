import type { ReactNode } from "react";
import { H2 } from "~/components/ui/typography";

interface EventCardProps {
  event: {
    id: string;
    name: string;
    type: string;
    datetime: Date | string;
    location: string | null;
    note: string | null;
  };
  actions?: ReactNode;
}

const getEventTypeLabel = (type: string): string => {
  const typeMap: Record<string, string> = {
    TRAINING: "Trening",
    MATCH: "Kamp",
    SOCIAL: "Sosialt",
    OTHER: "Annet",
  };
  return typeMap[type] || type;
};

export default function EventCard({ event, actions }: EventCardProps) {
  return (
    <div className="space-y-4 rounded-lg border bg-card p-6 shadow transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <H2>{event.name}</H2>
        {actions}
      </div>
      <div className="space-y-2 text-muted-foreground text-sm">
        <p>
          <strong>Type:</strong> {getEventTypeLabel(event.type)}
        </p>
        <p>
          <strong>Dato:</strong>{" "}
          {new Date(event.datetime).toLocaleString("nb-NO")}
        </p>
        <p>
          <strong>Sted:</strong> {event.location || "Ikke oppgitt"}
        </p>
        {event.note && (
          <p>
            <strong>Notat:</strong> {event.note}
          </p>
        )}
      </div>
    </div>
  );
}
