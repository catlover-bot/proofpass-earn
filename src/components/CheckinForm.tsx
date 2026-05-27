"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BadgeCheck, Loader2 } from "lucide-react";
import { Button, FieldError } from "@/components/ui";
import { checkInAction } from "@/lib/actions/checkin";
import { type Language } from "@/lib/i18n";
import { checkinFormSchema, type CheckinFormValues } from "@/lib/validation/checkin";

const formCopy = {
  en: {
    name: "Name",
    namePlaceholder: "Name to show on your proof",
    email: "Email",
    emailPlaceholder: "Used for organizer records, not public proof",
    proofNote: "QR check-in issues attendance proof only. Stronger labels require organizer approval.",
    completing: "Completing check-in...",
    submit: "Complete check-in"
  },
  ja: {
    name: "名前",
    namePlaceholder: "公開証明ページに表示する名前",
    email: "メールアドレス",
    emailPlaceholder: "主催者管理と重複確認に使用します",
    proofNote: "QRチェックインで発行されるのは「参加」と「QRチェックイン済み」のみです。強いラベルは主催者承認後に追加されます。",
    completing: "チェックイン中...",
    submit: "チェックインを完了する"
  }
} satisfies Record<Language, Record<string, string>>;

export function CheckinForm({
  eventCode,
  lang,
  inviteToken,
  defaultName = "",
  defaultEmail = ""
}: {
  eventCode: string;
  lang: Language;
  inviteToken?: string;
  defaultName?: string;
  defaultEmail?: string;
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
      role: "attendee",
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
      <input type="hidden" value="attendee" {...register("role")} />

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

      <p className="rounded-md border border-cyan-200 bg-cyan-50 px-3 py-2 text-sm font-semibold leading-6 text-cyan-950">
        {t.proofNote}
      </p>

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
