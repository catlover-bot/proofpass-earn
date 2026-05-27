"use client";

import type { FormEvent } from "react";
import { useState, useTransition } from "react";
import { MailPlus, Loader2, UsersRound } from "lucide-react";
import { Button } from "@/components/ui";
import { addBulkInvitationsAction, addInvitationAction } from "@/lib/actions/invitations";
import { type Language } from "@/lib/i18n";
import type { ParticipantRole } from "@/lib/supabase/types";

const copy = {
  en: {
    singleTitle: "Add one invitation",
    email: "Email",
    emailPlaceholder: "participant@example.com",
    name: "Name",
    namePlaceholder: "Optional",
    role: "Invite role note",
    noRole: "No role note",
    add: "Add invitation",
    adding: "Adding...",
    bulkTitle: "Bulk paste",
    bulkHelp: "One email per line. You can also paste Name <email@example.com>. Invite roles do not approve proof labels.",
    bulkPlaceholder: "Demo Participant <demo-participant@example.com>\nparticipant@example.com",
    addBulk: "Add invitations",
    addingBulk: "Adding invitations..."
  },
  ja: {
    singleTitle: "1件ずつ招待を追加",
    email: "メールアドレス",
    emailPlaceholder: "participant@example.com",
    name: "名前",
    namePlaceholder: "任意",
    role: "招待時の役割メモ",
    noRole: "役割メモなし",
    add: "招待を追加",
    adding: "追加中...",
    bulkTitle: "まとめて貼り付け",
    bulkHelp: "1行に1メールアドレスを入力します。Name <email@example.com> 形式にも対応しています。招待時の役割は証明ラベルの承認にはなりません。",
    bulkPlaceholder: "デモ参加者 <demo-participant@example.com>\nparticipant@example.com",
    addBulk: "招待を追加",
    addingBulk: "招待を追加中..."
  }
} satisfies Record<Language, Record<string, string>>;

const roleOptions = {
  en: [
    { value: "attendee", label: "Attendee" },
    { value: "speaker", label: "Speaker" },
    { value: "contributor", label: "Contributor" },
    { value: "organizer", label: "Organizer" }
  ],
  ja: [
    { value: "attendee", label: "参加者" },
    { value: "speaker", label: "登壇者" },
    { value: "contributor", label: "貢献者" },
    { value: "organizer", label: "主催者" }
  ]
} satisfies Record<Language, { value: ParticipantRole; label: string }[]>;

export function EventInvitationForm({ eventId, lang }: { eventId: string; lang: Language }) {
  const t = copy[lang];
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<ParticipantRole | "">("");
  const [bulkText, setBulkText] = useState("");
  const [bulkRole, setBulkRole] = useState<ParticipantRole | "">("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSingleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    startTransition(() => {
      void addInvitationAction({
        eventId,
        email,
        name,
        role: role || undefined,
        lang
      }).then((result) => {
        if (result.error) {
          setError(result.error);
          return;
        }

        setMessage(result.message ?? null);
        setEmail("");
        setName("");
        setRole("");
      });
    });
  }

  function handleBulkSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    startTransition(() => {
      void addBulkInvitationsAction({
        eventId,
        bulkText,
        role: bulkRole || undefined,
        lang
      }).then((result) => {
        if (result.error) {
          setError(result.error);
          return;
        }

        setMessage(result.message ?? null);
        setBulkText("");
        setBulkRole("");
      });
    });
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <form className="space-y-4 rounded-xl border border-slate-200 bg-paper/70 p-4" onSubmit={handleSingleSubmit}>
        <div className="flex items-center gap-2">
          <MailPlus className="h-5 w-5 text-mint" />
          <h3 className="font-bold text-ink">{t.singleTitle}</h3>
        </div>
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-800">{t.email}</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10"
            placeholder={t.emailPlaceholder}
            required
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-800">{t.name}</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10"
            placeholder={t.namePlaceholder}
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-800">{t.role}</span>
          <select
            value={role}
            onChange={(event) => setRole(event.target.value as ParticipantRole | "")}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10"
          >
            <option value="">{t.noRole}</option>
            {roleOptions[lang].map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MailPlus className="h-4 w-4" />}
          {isPending ? t.adding : t.add}
        </Button>
      </form>

      <form className="space-y-4 rounded-xl border border-slate-200 bg-paper/70 p-4" onSubmit={handleBulkSubmit}>
        <div className="flex items-center gap-2">
          <UsersRound className="h-5 w-5 text-mint" />
          <h3 className="font-bold text-ink">{t.bulkTitle}</h3>
        </div>
        <p className="text-sm leading-6 text-slate-600">{t.bulkHelp}</p>
        <textarea
          rows={6}
          value={bulkText}
          onChange={(event) => setBulkText(event.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10"
          placeholder={t.bulkPlaceholder}
          required
        />
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-800">{t.role}</span>
          <select
            value={bulkRole}
            onChange={(event) => setBulkRole(event.target.value as ParticipantRole | "")}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10"
          >
            <option value="">{t.noRole}</option>
            {roleOptions[lang].map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UsersRound className="h-4 w-4" />}
          {isPending ? t.addingBulk : t.addBulk}
        </Button>
      </form>

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 lg:col-span-2">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800 lg:col-span-2">
          {message}
        </p>
      ) : null}
    </div>
  );
}
