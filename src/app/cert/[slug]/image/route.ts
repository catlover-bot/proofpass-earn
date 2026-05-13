import { NextResponse } from "next/server";
import { formatDate } from "@/lib/format";
import { getLanguageFromSearchParams, labelForValue, type Language, type SearchParamsLike } from "@/lib/i18n";
import { labelProofType } from "@/lib/proof-types";
import { getMissingEnv, getSupabaseClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

type CertificateRecord = {
  event_id: string;
  participant_id: string;
  public_slug: string;
  certificate_type: string;
  status: string;
  issued_at: string;
  contract_address?: string | null;
  token_id?: string | null;
};

const BASE_CERTIFICATE_SELECT = "event_id,participant_id,public_slug,certificate_type,status,issued_at";
const SBT_CERTIFICATE_SELECT = `${BASE_CERTIFICATE_SELECT},contract_address,token_id`;

const copy = {
  en: {
    title: "PROOFPASS EVENT PROOF CARD",
    brand: "PROOFPASS",
    cardType: "EVENT PROOF CARD",
    subtitle: "NFT/SBT-style event proof record",
    participant: "Participant",
    event: "Event",
    type: "Proof type",
    issued: "Issued",
    status: "Status",
    walletFirst: "WALLET-FREE",
    privacy: "Wallet-free public proof page first",
    advanced: "Optional non-transferable SBT for advanced pilots",
    sbtReady: "TESTNET SBT",
    proofId: "Proof ID",
    missingTitle: "Proof image unavailable",
    missingText: "This proof card could not be generated."
  },
  ja: {
    title: "PROOFPASS EVENT PROOF CARD",
    brand: "PROOFPASS",
    cardType: "EVENT PROOF CARD",
    subtitle: "NFT/SBTスタイルのイベント証明記録",
    participant: "参加者",
    event: "イベント",
    type: "証明タイプ",
    issued: "発行日",
    status: "ステータス",
    walletFirst: "WALLET-FREE",
    privacy: "まずはウォレット不要の公開証明ページ",
    advanced: "高度な実証では任意の譲渡不可SBT",
    sbtReady: "TESTNET SBT",
    proofId: "証明ID",
    missingTitle: "証明画像を生成できません",
    missingText: "この証明カードは現在表示できません。"
  }
} satisfies Record<Language, Record<string, string>>;

function escapeXml(value: string | null | undefined) {
  return (value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function truncate(value: string, maxLength: number) {
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}…` : value;
}

function svgResponse(svg: string, status = 200) {
  return new NextResponse(svg, {
    status,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=300"
    }
  });
}

function renderProofCard(input: {
  lang: Language;
  certificate: CertificateRecord;
  eventTitle: string;
  participantName: string;
  participantRole: string;
}) {
  const t = copy[input.lang];
  const hasTestnetSbt = Boolean(input.certificate.contract_address && input.certificate.token_id);
  const proofType = labelProofType(input.lang, input.certificate.certificate_type);
  const role = labelForValue(input.lang, input.participantRole);
  const status = labelForValue(input.lang, input.certificate.status);
  const eventTitle = truncate(input.eventTitle, 46);
  const participantName = truncate(input.participantName, 34);
  const proofId = truncate(input.certificate.public_slug, 34);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(t.title)}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#0F172A"/>
      <stop offset="0.48" stop-color="#123A43"/>
      <stop offset="1" stop-color="#43146A"/>
    </linearGradient>
    <linearGradient id="card" x1="160" y1="84" x2="1040" y2="546" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.96"/>
      <stop offset="1" stop-color="#F8FAFC" stop-opacity="0.9"/>
    </linearGradient>
    <linearGradient id="holo" x1="185" y1="96" x2="1015" y2="530" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#34D399"/>
      <stop offset="0.36" stop-color="#22D3EE"/>
      <stop offset="0.7" stop-color="#A78BFA"/>
      <stop offset="1" stop-color="#FBBF24"/>
    </linearGradient>
    <filter id="shadow" x="110" y="40" width="980" height="560" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feDropShadow dx="0" dy="28" stdDeviation="30" flood-color="#020617" flood-opacity="0.38"/>
    </filter>
    <pattern id="grid" width="42" height="42" patternUnits="userSpaceOnUse">
      <path d="M42 0H0V42" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#grid)"/>
  <circle cx="1008" cy="100" r="190" fill="#22D3EE" fill-opacity="0.18"/>
  <circle cx="168" cy="548" r="210" fill="#A78BFA" fill-opacity="0.2"/>
  <circle cx="1000" cy="520" r="128" stroke="#FFFFFF" stroke-opacity="0.22" stroke-width="2"/>
  <circle cx="1000" cy="520" r="82" stroke="#FFFFFF" stroke-opacity="0.16" stroke-width="2"/>
  <g filter="url(#shadow)">
    <rect x="148" y="72" width="904" height="486" rx="36" fill="url(#holo)" opacity="0.95"/>
    <rect x="160" y="84" width="880" height="462" rx="30" fill="url(#card)"/>
  </g>
  <path d="M196 146H1004" stroke="#0F172A" stroke-opacity="0.08" stroke-width="2"/>
  <text x="198" y="132" fill="#0F172A" font-family="Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="18" font-weight="900" letter-spacing="2.2">${escapeXml(t.brand)}</text>
  <text x="198" y="168" fill="#0F172A" font-family="Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="30" font-weight="900" letter-spacing="1.3">${escapeXml(t.cardType)}</text>
  <rect x="826" y="116" width="178" height="40" rx="20" fill="${hasTestnetSbt ? "#F5F3FF" : "#ECFEFF"}" stroke="${hasTestnetSbt ? "#C4B5FD" : "#A5F3FC"}"/>
  <text x="852" y="142" fill="${hasTestnetSbt ? "#5B21B6" : "#155E75"}" font-family="Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="16" font-weight="900" letter-spacing="0.8">${escapeXml(hasTestnetSbt ? t.sbtReady : t.walletFirst)}</text>
  <text x="198" y="236" fill="#0F172A" font-family="Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="54" font-weight="900">${escapeXml(eventTitle)}</text>
  <text x="198" y="280" fill="#475569" font-family="Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="24" font-weight="700">${escapeXml(t.subtitle)}</text>
  <g>
    <rect x="198" y="310" width="382" height="86" rx="18" fill="#F8FAFC" stroke="#E2E8F0"/>
    <text x="224" y="340" fill="#64748B" font-family="Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="16" font-weight="800" letter-spacing="1.2">${escapeXml(t.participant.toUpperCase())}</text>
    <text x="224" y="374" fill="#0F172A" font-family="Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="28" font-weight="900">${escapeXml(participantName)}</text>
  </g>
  <g>
    <rect x="620" y="310" width="384" height="86" rx="18" fill="#F8FAFC" stroke="#E2E8F0"/>
    <text x="646" y="340" fill="#64748B" font-family="Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="16" font-weight="800" letter-spacing="1.2">${escapeXml(t.type.toUpperCase())}</text>
    <text x="646" y="374" fill="#0F172A" font-family="Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="28" font-weight="900">${escapeXml(proofType)} · ${escapeXml(role)}</text>
  </g>
  <g>
    <rect x="198" y="424" width="244" height="74" rx="18" fill="#ECFDF5" stroke="#A7F3D0"/>
    <text x="224" y="453" fill="#047857" font-family="Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="15" font-weight="900">${escapeXml(t.status.toUpperCase())}</text>
    <text x="224" y="480" fill="#064E3B" font-family="Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="24" font-weight="900">${escapeXml(status)}</text>
  </g>
  <g>
    <rect x="466" y="424" width="246" height="74" rx="18" fill="#F0FDFA" stroke="#99F6E4"/>
    <text x="492" y="453" fill="#0F766E" font-family="Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="15" font-weight="900">${escapeXml(t.issued.toUpperCase())}</text>
    <text x="492" y="480" fill="#134E4A" font-family="Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="22" font-weight="900">${escapeXml(formatDate(input.certificate.issued_at))}</text>
  </g>
  <g>
    <rect x="736" y="424" width="268" height="74" rx="18" fill="#F5F3FF" stroke="#DDD6FE"/>
    <text x="762" y="453" fill="#6D28D9" font-family="Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="15" font-weight="900">${escapeXml(t.proofId.toUpperCase())}</text>
    <text x="762" y="480" fill="#4C1D95" font-family="Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="20" font-weight="900">${escapeXml(proofId)}</text>
  </g>
  <text x="198" y="528" fill="#475569" font-family="Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="18" font-weight="800">${escapeXml(t.advanced)}</text>
  <path d="M976 196C936 194 896 214 876 248C856 282 860 326 886 356C912 386 956 396 992 380C1028 364 1050 328 1046 288C1042 230 1018 198 976 196Z" fill="url(#holo)" opacity="0.28"/>
  <path d="M946 258L990 302L1080 212" stroke="#0F172A" stroke-width="18" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>
</svg>`;
}

function renderFallback(lang: Language, status = 404) {
  const t = copy[lang];

  return svgResponse(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(t.missingTitle)}">
  <rect width="1200" height="630" fill="#0F172A"/>
  <rect x="180" y="170" width="840" height="290" rx="32" fill="#FFFFFF" opacity="0.94"/>
  <text x="240" y="286" fill="#0F172A" font-family="Inter, ui-sans-serif, system-ui, sans-serif" font-size="48" font-weight="900">${escapeXml(t.missingTitle)}</text>
  <text x="240" y="346" fill="#475569" font-family="Inter, ui-sans-serif, system-ui, sans-serif" font-size="26" font-weight="700">${escapeXml(t.missingText)}</text>
</svg>`, status);
}

function isMissingOptionalSbtColumn(error: { code?: string; message?: string }) {
  const message = error.message ?? "";

  return error.code === "42703" || error.code === "PGRST204" || message.includes("contract_address") || message.includes("token_id");
}

export async function GET(
  request: Request,
  {
    params
  }: {
    params: Promise<{ slug: string }>;
  }
) {
  const { slug } = await params;
  const lang = getLanguageFromSearchParams(Object.fromEntries(new URL(request.url).searchParams) as SearchParamsLike);

  if (getMissingEnv().length > 0) {
    return renderFallback(lang, 503);
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return renderFallback(lang, 503);
  }

  const certificateResult = await supabase
    .from("certificates")
    .select(SBT_CERTIFICATE_SELECT)
    .eq("public_slug", slug)
    .maybeSingle();

  let certificate = certificateResult.data as CertificateRecord | null;
  let certificateError = certificateResult.error;

  if (certificateError && isMissingOptionalSbtColumn(certificateError)) {
    const fallbackCertificateResult = await supabase
      .from("certificates")
      .select(BASE_CERTIFICATE_SELECT)
      .eq("public_slug", slug)
      .maybeSingle();

    certificate = fallbackCertificateResult.data as CertificateRecord | null;
    certificateError = fallbackCertificateResult.error;
  }

  if (certificateError || !certificate) {
    return renderFallback(lang, certificateError ? 500 : 404);
  }

  const [{ data: event, error: eventError }, { data: participant, error: participantError }] = await Promise.all([
    supabase.from("events").select("title").eq("id", certificate.event_id).maybeSingle(),
    supabase.from("participants").select("name,role").eq("id", certificate.participant_id).maybeSingle()
  ]);

  if (eventError || participantError || !event || !participant) {
    return renderFallback(lang, 500);
  }

  return svgResponse(
    renderProofCard({
      lang,
      certificate,
      eventTitle: event.title,
      participantName: participant.name,
      participantRole: participant.role
    })
  );
}
