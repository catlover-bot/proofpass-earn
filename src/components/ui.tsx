import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function PageShell({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <main className={cn("mx-auto w-full max-w-6xl px-5 py-7 sm:px-6 sm:py-8 lg:px-8", className)}>
      {children}
    </main>
  );
}

export function Card({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-xl border border-slate-200/80 bg-white/95 p-6 shadow-soft", className)}>
      {children}
    </section>
  );
}

const buttonStyles = {
  primary:
    "bg-ink text-white shadow-sm hover:bg-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
  secondary:
    "border border-slate-300 bg-white text-ink shadow-sm hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500",
  subtle:
    "bg-slate-100 text-slate-800 hover:bg-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className
}: {
  href: string;
  children: ReactNode;
  variant?: keyof typeof buttonStyles;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition",
        buttonStyles[variant],
        className
      )}
    >
      {children}
    </Link>
  );
}

export function Button({
  children,
  className,
  variant = "primary",
  ...props
}: ComponentPropsWithoutRef<"button"> & {
  variant?: keyof typeof buttonStyles;
}) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
        buttonStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm font-medium text-red-700">{message}</p>;
}

export function StatusPill({
  children,
  tone = "neutral"
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "info" | "testnet" | "pilot";
}) {
  const tones = {
    neutral: "border-slate-200 bg-slate-100 text-slate-700",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
    danger: "border-red-200 bg-red-50 text-red-800",
    info: "border-cyan-200 bg-cyan-50 text-cyan-800",
    testnet: "border-violet-200 bg-violet-50 text-violet-800",
    pilot: "border-amber-200 bg-amber-50 text-amber-900"
  };

  return (
    <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold", tones[tone])}>
      {children}
    </span>
  );
}

export const Badge = StatusPill;

export function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="text-sm font-semibold uppercase tracking-[0.18em] text-mint">{children}</p>;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? <SectionLabel>{eyebrow}</SectionLabel> : null}
        <h1 className="mt-2 text-3xl font-bold text-ink sm:text-4xl">{title}</h1>
        {description ? <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-700 sm:text-base">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function InfoCard({
  title,
  children,
  className
}: {
  title: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("p-5", className)}>
      <h3 className="text-lg font-bold text-ink">{title}</h3>
      <div className="mt-3 text-sm leading-6 text-slate-700">{children}</div>
    </Card>
  );
}

export function EmptyState({
  title,
  children,
  action
}: {
  title: ReactNode;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <Card className="border-dashed bg-white/80 text-center shadow-none">
      <h2 className="text-xl font-bold text-ink">{title}</h2>
      <div className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-700">{children}</div>
      {action ? <div className="mt-5">{action}</div> : null}
    </Card>
  );
}
