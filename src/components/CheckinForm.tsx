"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BadgeCheck, Loader2 } from "lucide-react";
import { checkInAction } from "@/lib/actions/checkin";
import { checkinFormSchema, type CheckinFormValues } from "@/lib/validation/checkin";
import { Button, FieldError } from "@/components/ui";

const roleOptions = [
  { value: "attendee", label: "Attendee", description: "joined the event", points: 10 },
  { value: "speaker", label: "Speaker", description: "gave a talk or presentation", points: 50 },
  { value: "contributor", label: "Contributor", description: "helped with the event or materials", points: 30 },
  { value: "organizer", label: "Organizer", description: "organized or hosted the event", points: 40 }
] as const;

export function CheckinForm({ eventCode }: { eventCode: string }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<CheckinFormValues>({
    resolver: zodResolver(checkinFormSchema),
    defaultValues: {
      eventCode,
      name: "",
      email: "",
      role: "attendee"
    }
  });

  const onSubmit = (values: CheckinFormValues) => {
    setServerError(null);
    startTransition(() => {
      void checkInAction(values).then((result) => {
        if (result?.error) {
          setServerError(result.error);
        }
      });
    });
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <input type="hidden" {...register("eventCode")} />

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-slate-800">Name</span>
        <input
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10"
          placeholder="Name to show on your proof"
          {...register("name")}
        />
        <FieldError message={errors.name?.message} />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-slate-800">Email</span>
        <input
          type="email"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10"
          placeholder="Used for organizer records, not public proof"
          {...register("email")}
        />
        <FieldError message={errors.email?.message} />
      </label>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-slate-800">How did you participate?</legend>
        <div className="grid gap-3">
          {roleOptions.map((role) => (
            <label
              key={role.value}
              className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-mint/50 has-[:checked]:border-mint has-[:checked]:bg-emerald-50/60"
            >
              <input
                type="radio"
                value={role.value}
                className="mt-1 h-4 w-4 accent-mint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                {...register("role")}
              />
              <span className="flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-ink">{role.label}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
                    {role.points} pts
                  </span>
                </span>
                <span className="mt-1 block text-sm leading-6 text-slate-600">{role.description}</span>
              </span>
            </label>
          ))}
        </div>
        <FieldError message={errors.role?.message} />
      </fieldset>

      {serverError ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {serverError}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <BadgeCheck className="h-4 w-4" />}
        {isPending ? "Completing check-in..." : "Complete check-in"}
      </Button>
    </form>
  );
}
