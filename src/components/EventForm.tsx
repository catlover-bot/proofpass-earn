"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarPlus, Loader2 } from "lucide-react";
import { createEventAction } from "@/lib/actions/events";
import { eventFormSchema, type EventFormValues } from "@/lib/validation/event";
import { Button, FieldError } from "@/components/ui";

export function EventForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      starts_at: "",
      ends_at: ""
    }
  });

  const onSubmit = (values: EventFormValues) => {
    setServerError(null);
    startTransition(() => {
      void createEventAction(values).then((result) => {
        if (result?.error) {
          setServerError(result.error);
        }
      });
    });
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-5 md:grid-cols-2">
        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-semibold text-slate-800">Event title</span>
          <input
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10"
            placeholder="Weekly research reading group"
            {...register("title")}
          />
          <FieldError message={errors.title?.message} />
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-semibold text-slate-800">Description</span>
          <textarea
            rows={4}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10"
            placeholder="Short description shown on check-in and proof pages"
            {...register("description")}
          />
          <FieldError message={errors.description?.message} />
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-semibold text-slate-800">Location</span>
          <input
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10"
            placeholder="Room name, venue, or online"
            {...register("location")}
          />
          <FieldError message={errors.location?.message} />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-800">Starts at</span>
          <input
            type="datetime-local"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10"
            {...register("starts_at")}
          />
          <p className="text-xs leading-5 text-slate-500">Use the local event time.</p>
          <FieldError message={errors.starts_at?.message} />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-800">Ends at</span>
          <input
            type="datetime-local"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10"
            {...register("ends_at")}
          />
          <p className="text-xs leading-5 text-slate-500">Must be after the start time.</p>
          <FieldError message={errors.ends_at?.message} />
        </label>
      </div>

      <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-700">
        You can create a new event if details change during the pilot.
      </p>

      {serverError ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {serverError}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarPlus className="h-4 w-4" />}
        {isPending ? "Creating event..." : "Create event and generate QR"}
      </Button>
    </form>
  );
}
