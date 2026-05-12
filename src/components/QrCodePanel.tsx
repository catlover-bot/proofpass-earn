"use client";

import QRCode from "react-qr-code";
import { QrCode } from "lucide-react";

export function QrCodePanel({ value }: { value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
        <QrCode className="h-4 w-4" />
        QR check-in
      </div>
      <div className="mx-auto flex aspect-square w-full max-w-64 items-center justify-center rounded-md bg-white p-4">
        <QRCode value={value} size={224} className="h-full w-full" />
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-700">
        Display this QR code at the venue or share the link in an online meeting.
      </p>
    </div>
  );
}
