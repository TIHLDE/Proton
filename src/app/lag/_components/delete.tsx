"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type z from "zod";
import FormInput from "~/components/form/input";
import SubmitButton from "~/components/form/submit-button";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Form } from "~/components/ui/form";
import { UpdateTeamInputSchema } from "~/schemas";
import { api } from "~/trpc/react";

interface EditTeamProps {
  team: {
    id: string;
    name: string;
    slug: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
}

export default function EditTeam({ team }: EditTeamProps) {
  const [open, setOpen] = useState<boolean>(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof UpdateTeamInputSchema>>({
    resolver: zodResolver(UpdateTeamInputSchema),
    defaultValues: {
      id: team.id,
      name: team.name,
      slug: team.slug || "",
    },
  });

  const { mutate: updateTeam, status } = api.team.update.useMutation({
    onSuccess: (_, variables) => {
      setOpen(false);
      form.reset({
        id: variables.id,
        name: variables.name,
        slug: variables.slug || "",
      });
      router.refresh();
      toast.success("Lag oppdatert!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = async (values: z.infer<typeof UpdateTeamInputSchema>) =>
    updateTeam(values);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Endre lag</DialogTitle>
          <DialogDescription>
            Fyll inn informasjonen under for å endre idrettslaget.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            className="mt-6 space-y-8"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <input type="hidden" {...form.register("id")} />

            <FormInput
              form={form}
              name="name"
              label="Navn"
              placeholder="Navn på laget"
              required
            />

            <FormInput
              form={form}
              name="slug"
              label="Nettside-slug"
              placeholder="Nettside-slug til laget"
              description="Vi trenger denne for å hente medlemskap"
            />

            <div className="md:flex md:justify-end">
              <SubmitButton
                status={status}
                text="Endre laget"
                className="md:w-auto"
              />
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
