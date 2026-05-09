"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BadgeCheck, Loader2 } from "lucide-react";
import { checkInAction } from "@/lib/actions/checkin";
import { checkinFormSchema, type CheckinFormValues } from "@/lib/validation/checkin";
import { Button, FieldError } from "@/components/ui";

const roleOptions = [
  { value: "attendee", label: "Attendee", points: 10 },
  { value: "speaker", label: "Speaker", points: 50 },
  { value: "contributor", label: "Contributor", points: 100 },
  { value: "organizer", label: "Organizer", points: 100 }
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

      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-800">Name</span>
        <input
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10"
          placeholder="Your public proof name"
          {...register("name")}
        />
        <FieldError message={errors.name?.message} />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-800">Email</span>
        <input
          type="email"
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10"
          placeholder="Used for organizer records only"
          {...register("email")}
        />
        <FieldError message={errors.email?.message} />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-800">Role</span>
        <select
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10"
          {...register("role")}
        >
          {roleOptions.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label} · {role.points} points
            </option>
          ))}
        </select>
        <FieldError message={errors.role?.message} />
      </label>

      {serverError ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {serverError}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <BadgeCheck className="h-4 w-4" />}
        Complete check-in
      </Button>
    </form>
  );
}
