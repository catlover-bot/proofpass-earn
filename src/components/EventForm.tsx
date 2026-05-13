"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarPlus, Loader2 } from "lucide-react";
import { Button, FieldError } from "@/components/ui";
import { createEventAction } from "@/lib/actions/events";
import { type Language } from "@/lib/i18n";
import { eventFormSchema, type EventFormValues } from "@/lib/validation/event";

const formCopy = {
  en: {
    title: "Event title",
    titlePlaceholder: "Weekly research reading group",
    description: "Description",
    descriptionPlaceholder: "Short description shown on check-in and proof pages",
    location: "Location",
    locationPlaceholder: "Room name, venue, or online",
    startsAt: "Starts at",
    startsHelp: "Use the local event time.",
    endsAt: "Ends at",
    endsHelp: "Must be after the start time.",
    modeLabel: "Check-in mode",
    publicMode: "Public QR check-in",
    publicModeHelp: "Anyone with the QR link can check in.",
    inviteOnlyMode: "Invite-only check-in",
    inviteOnlyModeHelp: "Participants use an invitation link or matching invited email.",
    helper: "You can create a new event if details change during the pilot.",
    creating: "Creating event...",
    submit: "Create event and generate QR"
  },
  ja: {
    title: "イベント名",
    titlePlaceholder: "週次研究会",
    description: "説明",
    descriptionPlaceholder: "チェックインページと証明ページに表示される短い説明",
    location: "場所",
    locationPlaceholder: "会場名、部屋名、またはオンライン",
    startsAt: "開始日時",
    startsHelp: "イベントの現地時間で入力してください。",
    endsAt: "終了日時",
    endsHelp: "開始日時より後にしてください。",
    modeLabel: "チェックイン方式",
    publicMode: "公開QRチェックイン",
    publicModeHelp: "QRリンクを知っている人がチェックインできます。",
    inviteOnlyMode: "招待者限定チェックイン",
    inviteOnlyModeHelp: "招待リンク、または招待済みメールアドレスでチェックインします。",
    helper: "パイロット中に内容が大きく変わった場合は、新しいイベントを作成してください。",
    creating: "イベントを作成中...",
    submit: "イベントを作成してQRを生成"
  }
} satisfies Record<Language, Record<string, string>>;

export function EventForm({ lang }: { lang: Language }) {
  const t = formCopy[lang];
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
      ends_at: "",
      checkin_mode: "public",
      lang
    }
  });

  const onSubmit = (values: EventFormValues) => {
    setServerError(null);
    startTransition(() => {
      void createEventAction({ ...values, lang }).then((result) => {
        if (result?.error) {
          setServerError(result.error);
        }
      });
    });
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <input type="hidden" value={lang} {...register("lang")} />

      <div className="grid gap-5 md:grid-cols-2">
        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-semibold text-slate-800">{t.title}</span>
          <input
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10"
            placeholder={t.titlePlaceholder}
            {...register("title")}
          />
          <FieldError message={errors.title?.message} />
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-semibold text-slate-800">{t.description}</span>
          <textarea
            rows={4}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10"
            placeholder={t.descriptionPlaceholder}
            {...register("description")}
          />
          <FieldError message={errors.description?.message} />
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-semibold text-slate-800">{t.location}</span>
          <input
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10"
            placeholder={t.locationPlaceholder}
            {...register("location")}
          />
          <FieldError message={errors.location?.message} />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-800">{t.startsAt}</span>
          <input
            type="datetime-local"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10"
            {...register("starts_at")}
          />
          <p className="text-xs leading-5 text-slate-500">{t.startsHelp}</p>
          <FieldError message={errors.starts_at?.message} />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-800">{t.endsAt}</span>
          <input
            type="datetime-local"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10"
            {...register("ends_at")}
          />
          <p className="text-xs leading-5 text-slate-500">{t.endsHelp}</p>
          <FieldError message={errors.ends_at?.message} />
        </label>

        <fieldset className="space-y-3 md:col-span-2">
          <legend className="text-sm font-semibold text-slate-800">{t.modeLabel}</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-mint/50 has-[:checked]:border-mint has-[:checked]:bg-emerald-50/60">
              <input
                type="radio"
                value="public"
                className="mt-1 h-4 w-4 accent-mint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                {...register("checkin_mode")}
              />
              <span>
                <span className="block font-bold text-ink">{t.publicMode}</span>
                <span className="mt-1 block text-sm leading-6 text-slate-600">{t.publicModeHelp}</span>
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-mint/50 has-[:checked]:border-mint has-[:checked]:bg-emerald-50/60">
              <input
                type="radio"
                value="invite_only"
                className="mt-1 h-4 w-4 accent-mint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                {...register("checkin_mode")}
              />
              <span>
                <span className="block font-bold text-ink">{t.inviteOnlyMode}</span>
                <span className="mt-1 block text-sm leading-6 text-slate-600">{t.inviteOnlyModeHelp}</span>
              </span>
            </label>
          </div>
          <FieldError message={errors.checkin_mode?.message} />
        </fieldset>
      </div>

      <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-700">
        {t.helper}
      </p>

      {serverError ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {serverError}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarPlus className="h-4 w-4" />}
        {isPending ? t.creating : t.submit}
      </Button>
    </form>
  );
}
