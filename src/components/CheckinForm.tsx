"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BadgeCheck, Loader2 } from "lucide-react";
import { Button, FieldError } from "@/components/ui";
import { checkInAction } from "@/lib/actions/checkin";
import { type Language } from "@/lib/i18n";
import type { ParticipantRole } from "@/lib/supabase/types";
import { checkinFormSchema, type CheckinFormValues } from "@/lib/validation/checkin";

const roleOptions = {
  en: [
    { value: "attendee", label: "Attendance", description: "adds an attendance achievement" },
    { value: "speaker", label: "Speaker", description: "adds a speaker achievement" },
    { value: "contributor", label: "Contributor", description: "adds a contributor achievement" },
    { value: "organizer", label: "Organizer", description: "adds an organizer achievement" }
  ],
  ja: [
    { value: "attendee", label: "参加", description: "参加バッジを追加します" },
    { value: "speaker", label: "登壇者", description: "登壇者バッジを追加します" },
    { value: "contributor", label: "貢献者", description: "貢献者バッジを追加します" },
    { value: "organizer", label: "主催者", description: "主催者バッジを追加します" }
  ]
} as const;

const formCopy = {
  en: {
    name: "Name",
    namePlaceholder: "Name to show on your proof",
    email: "Email",
    emailPlaceholder: "Used for organizer records, not public proof",
    roleLegend: "How did you participate?",
    roleHelp: "Your selected role determines the proof type and achievement badge.",
    achievement: "achievement",
    completing: "Completing check-in...",
    submit: "Complete check-in"
  },
  ja: {
    name: "名前",
    namePlaceholder: "公開証明ページに表示する名前",
    email: "メールアドレス",
    emailPlaceholder: "主催者管理と重複確認に使用します",
    roleLegend: "どの形で参加しましたか？",
    roleHelp: "選択した参加種別に応じて、発行される証明タイプと達成バッジが変わります。",
    achievement: "達成",
    completing: "チェックイン中...",
    submit: "チェックインを完了する"
  }
} satisfies Record<Language, Record<string, string>>;

export function CheckinForm({
  eventCode,
  lang,
  inviteToken,
  defaultName = "",
  defaultEmail = "",
  defaultRole = "attendee"
}: {
  eventCode: string;
  lang: Language;
  inviteToken?: string;
  defaultName?: string;
  defaultEmail?: string;
  defaultRole?: ParticipantRole;
}) {
  const t = formCopy[lang];
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
      name: defaultName,
      email: defaultEmail,
      role: defaultRole,
      inviteToken,
      lang
    }
  });

  const onSubmit = (values: CheckinFormValues) => {
    setServerError(null);
    startTransition(() => {
      void checkInAction({ ...values, lang }).then((result) => {
        if (result?.error) {
          setServerError(result.error);
        }
      });
    });
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <input type="hidden" {...register("eventCode")} />
      <input type="hidden" value={inviteToken ?? ""} {...register("inviteToken")} />
      <input type="hidden" value={lang} {...register("lang")} />

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-slate-800">{t.name}</span>
        <input
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10"
          placeholder={t.namePlaceholder}
          {...register("name")}
        />
        <FieldError message={errors.name?.message} />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-slate-800">{t.email}</span>
        <input
          type="email"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10"
          placeholder={t.emailPlaceholder}
          {...register("email")}
        />
        <FieldError message={errors.email?.message} />
      </label>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-slate-800">{t.roleLegend}</legend>
        <p className="text-sm leading-6 text-slate-600">{t.roleHelp}</p>
        <div className="grid gap-3">
          {roleOptions[lang].map((role) => (
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
                    {t.achievement}
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
        {isPending ? t.completing : t.submit}
      </Button>
    </form>
  );
}
