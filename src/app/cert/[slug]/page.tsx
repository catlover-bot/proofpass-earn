import { ShieldAlert, ShieldCheck } from "lucide-react";
import { CopyButton } from "@/components/CopyButton";
import { PublicFooter } from "@/components/PublicFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SetupError } from "@/components/SetupError";
import { Card, PageShell, StatusPill } from "@/components/ui";
import { formatDate, formatDateTime } from "@/lib/format";
import { commonCopy, getLanguageFromSearchParams, labelForValue, type SearchParamsLike } from "@/lib/i18n";
import { getAppUrl, getMissingEnv, getSupabaseClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

type CertificateRecord = {
  id: string;
  event_id: string;
  participant_id: string;
  public_slug: string;
  certificate_type: string;
  status: string;
  issued_at: string;
  chain_id: number | string | null;
  chain_name?: string | null;
  contract_address: string | null;
  token_id: string | null;
  tx_hash: string | null;
  metadata_url: string | null;
  token_uri?: string | null;
  minted_at?: string | null;
  sbt_status?: string | null;
};

const BASE_CERTIFICATE_SELECT =
  "id,event_id,participant_id,public_slug,certificate_type,status,issued_at,chain_id,contract_address,token_id,tx_hash,metadata_url";
const SBT_CERTIFICATE_SELECT = `${BASE_CERTIFICATE_SELECT},chain_name,token_uri,minted_at,sbt_status`;
const BASE_SEPOLIA_CHAIN_ID = "84532";
const BASE_SEPOLIA_EXPLORER_URL = "https://sepolia.basescan.org";

function isMissingOptionalSbtColumn(error: { code?: string; message?: string }) {
  const message = error.message ?? "";

  return (
    error.code === "42703" ||
    error.code === "PGRST204" ||
    message.includes("chain_name") ||
    message.includes("token_uri") ||
    message.includes("minted_at") ||
    message.includes("sbt_status")
  );
}

function getChainIdLabel(chainId: number | string | null) {
  return chainId === null ? "" : String(chainId);
}

function getNetworkName(certificate: CertificateRecord) {
  if (certificate.chain_name) {
    return certificate.chain_name;
  }

  if (getChainIdLabel(certificate.chain_id) === BASE_SEPOLIA_CHAIN_ID) {
    return "Base Sepolia";
  }

  return certificate.chain_id ? `Chain ${certificate.chain_id}` : "Testnet";
}

function getExplorerUrl(certificate: CertificateRecord) {
  const networkName = getNetworkName(certificate).toLowerCase();

  if (getChainIdLabel(certificate.chain_id) === BASE_SEPOLIA_CHAIN_ID || networkName === "base sepolia") {
    return BASE_SEPOLIA_EXPLORER_URL;
  }

  return null;
}

function shortenHash(value: string) {
  if (value.length <= 12) {
    return value;
  }

  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

export default async function CertificatePage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParamsLike>;
}) {
  const { slug } = await params;
  const lang = getLanguageFromSearchParams(await searchParams);
  const common = commonCopy[lang];
  const copy = {
    en: {
      unableProof: "Unable to load proof",
      proofNotFound: "Proof not found",
      proofNotFoundText: "This proof URL does not match a public proof page.",
      unableDetails: "Unable to load proof details",
      detailsUnavailable: "Proof details unavailable",
      detailsUnavailableText: "The proof record exists, but its linked event or participant is missing.",
      revoked:
        "This proof has been revoked by the issuer and should not be treated as valid.",
      issuer: "Issuer",
      issuerName: "ProofPass Earn organizer",
      proofId: "Proof ID",
      share: "Share this proof link with your community, portfolio, or event recap.",
      advancedLabel: "Advanced proof record",
      sbtExplanation:
        "This proof was also recorded on Base Sepolia as a non-transferable testnet SBT. It is for pilot verification only and is not a financial asset.",
      network: "Network",
      tokenId: "Token ID",
      contractAddress: "Contract address",
      mintTransaction: "Mint transaction",
      metadata: "Metadata",
      locked: "Locked",
      checkContract: "Check contract",
      viewContract: "View contract on Basescan",
      viewTransaction: "View mint transaction on Basescan",
      metadataLabel: "Proof metadata",
      metadataTitle: "Structured proof metadata is available.",
      metadataText:
        "This proof has structured metadata and can be used for future badges, credentials, or optional SBT experiments.",
      emailHidden: "Participant email is not shown on this public page.",
      proofMeaning: "This proof represents event participation or contribution. It is not a financial asset.",
      testnet: "testnet",
      lockedBadge: "locked"
    },
    ja: {
      unableProof: "証明を読み込めません",
      proofNotFound: "証明が見つかりません",
      proofNotFoundText: "この証明URLに一致する公開証明ページはありません。",
      unableDetails: "証明の詳細を読み込めません",
      detailsUnavailable: "証明の詳細を表示できません",
      detailsUnavailableText: "証明レコードは存在しますが、関連するイベントまたは参加者が見つかりません。",
      revoked: "この証明は発行者によって取り消されているため、有効な証明として扱えません。",
      issuer: "発行者",
      issuerName: "ProofPass Earn organizer",
      proofId: "証明ID",
      share: "この証明リンクをコミュニティ、ポートフォリオ、イベントレポートなどで共有できます。",
      advancedLabel: "高度な証明記録",
      sbtExplanation:
        "この証明はBase Sepolia上の譲渡不可テストネットSBTとしても記録されています。パイロット検証用であり、金融資産ではありません。",
      network: "ネットワーク",
      tokenId: "トークンID",
      contractAddress: "コントラクトアドレス",
      mintTransaction: "発行トランザクション",
      metadata: "メタデータ",
      locked: "ロック状態",
      checkContract: "コントラクトを確認",
      viewContract: "Basescanでコントラクトを見る",
      viewTransaction: "Basescanで発行トランザクションを見る",
      metadataLabel: "証明メタデータ",
      metadataTitle: "構造化された証明メタデータを利用できます。",
      metadataText: "この証明は、将来のバッジ、資格情報、任意のテストネットSBT実験に活用できます。",
      emailHidden: "この公開ページには参加者のメールアドレスは表示されません。",
      proofMeaning: "この証明はイベント参加または貢献の記録です。金融資産ではありません。",
      testnet: "テストネット",
      lockedBadge: "譲渡不可"
    }
  }[lang];

  const missing = getMissingEnv();
  if (missing.length > 0) {
    return (
      <PageShell className="space-y-6">
        <SiteHeader lang={lang} />
        <SetupError missing={missing} />
        <PublicFooter lang={lang} />
      </PageShell>
    );
  }

  const supabase = getSupabaseClient();
  const appUrl = getAppUrl();
  if (!supabase) {
    return (
      <PageShell className="space-y-6">
        <SiteHeader lang={lang} />
        <SetupError message="Supabase is not configured yet." />
        <PublicFooter lang={lang} />
      </PageShell>
    );
  }

  let certificateResult = await supabase
    .from("certificates")
    .select(SBT_CERTIFICATE_SELECT)
    .eq("public_slug", slug)
    .maybeSingle();

  if (certificateResult.error && isMissingOptionalSbtColumn(certificateResult.error)) {
    certificateResult = await supabase
      .from("certificates")
      .select(BASE_CERTIFICATE_SELECT)
      .eq("public_slug", slug)
      .maybeSingle();
  }

  const certificate = certificateResult.data as CertificateRecord | null;
  const certificateError = certificateResult.error;

  if (certificateError) {
    return (
      <PageShell className="space-y-6">
        <SiteHeader lang={lang} />
        <SetupError title={copy.unableProof} message={certificateError.message} />
        <PublicFooter lang={lang} />
      </PageShell>
    );
  }

  if (!certificate) {
    return (
      <PageShell className="space-y-6">
        <SiteHeader lang={lang} />
        <Card>
          <h1 className="text-2xl font-bold text-ink">{copy.proofNotFound}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            {copy.proofNotFoundText}
          </p>
        </Card>
        <PublicFooter lang={lang} />
      </PageShell>
    );
  }

  const [{ data: event, error: eventError }, { data: participant, error: participantError }] =
    await Promise.all([
      supabase
        .from("events")
        .select("title,starts_at,ends_at,location")
        .eq("id", certificate.event_id)
        .maybeSingle(),
      supabase.from("participants").select("name,role").eq("id", certificate.participant_id).maybeSingle()
    ]);

  if (eventError || participantError) {
    return (
      <PageShell className="space-y-6">
        <SiteHeader lang={lang} />
        <SetupError
          title={copy.unableDetails}
          message={eventError?.message ?? participantError?.message}
        />
        <PublicFooter lang={lang} />
      </PageShell>
    );
  }

  if (!event || !participant) {
    return (
      <PageShell className="space-y-6">
        <SiteHeader lang={lang} />
        <Card>
          <h1 className="text-2xl font-bold text-ink">{copy.detailsUnavailable}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            {copy.detailsUnavailableText}
          </p>
        </Card>
        <PublicFooter lang={lang} />
      </PageShell>
    );
  }

  const revoked = certificate.status === "revoked";
  const proofUrl = `${appUrl}/cert/${certificate.public_slug}?lang=${lang}`;
  const metadataUrl = `${appUrl}/cert/${certificate.public_slug}/metadata`;
  const tokenUri = certificate.token_uri ?? certificate.metadata_url ?? metadataUrl;
  const hasOnChainSbt = Boolean(certificate.contract_address && certificate.token_id);
  const explorerUrl = getExplorerUrl(certificate);
  const contractUrl =
    explorerUrl && certificate.contract_address ? `${explorerUrl}/address/${certificate.contract_address}` : null;
  const txUrl = explorerUrl && certificate.tx_hash ? `${explorerUrl}/tx/${certificate.tx_hash}` : null;

  return (
    <PageShell className="max-w-4xl space-y-6">
      <SiteHeader lang={lang} />

      <Card className={revoked ? "border-red-200 bg-red-50 shadow-lift" : "border-mint/30 bg-white shadow-lift"}>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className={revoked ? "rounded-md bg-red-100 p-3 text-red-700" : "rounded-md bg-mint/10 p-3 text-mint"}>
                {revoked ? <ShieldAlert className="h-7 w-7" /> : <ShieldCheck className="h-7 w-7" />}
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">{common.publicProof}</p>
                <h1 className="text-3xl font-bold text-ink">{event.title}</h1>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-500">{common.participant}</p>
              <p className="mt-1 text-2xl font-bold text-ink">{participant.name}</p>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-500">{common.proofType}</p>
              <div className="mt-2">
                <StatusPill tone="success">{labelForValue(lang, certificate.certificate_type)}</StatusPill>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <StatusPill tone={revoked ? "danger" : "success"}>{labelForValue(lang, certificate.status)}</StatusPill>
            {hasOnChainSbt ? <StatusPill tone="warning">{copy.testnet}</StatusPill> : null}
          </div>
        </div>

        {revoked ? (
          <div className="mt-6 rounded-md border border-red-200 bg-white p-4 text-sm font-medium text-red-700">
            {copy.revoked}
          </div>
        ) : null}
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="bg-paper/70 p-5 shadow-none">
          <p className="text-sm font-semibold text-slate-500">{common.participantRole}</p>
          <p className="mt-1 text-xl font-bold text-ink">{labelForValue(lang, participant.role)}</p>
        </Card>
        <Card className="bg-paper/70 p-5 shadow-none">
          <p className="text-sm font-semibold text-slate-500">{common.eventDate}</p>
          <p className="mt-1 text-xl font-bold text-ink">{formatDate(event.starts_at)}</p>
        </Card>
        <Card className="bg-paper/70 p-5 shadow-none">
          <p className="text-sm font-semibold text-slate-500">{common.issuedAt}</p>
          <p className="mt-1 text-xl font-bold text-ink">{formatDateTime(certificate.issued_at)}</p>
        </Card>
        <Card className="bg-paper/70 p-5 shadow-none">
          <p className="text-sm font-semibold text-slate-500">{common.location}</p>
          <p className="mt-1 text-xl font-bold text-ink">{event.location}</p>
        </Card>
      </div>

      <Card>
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-semibold text-slate-500">{copy.issuer}</dt>
            <dd className="mt-1 font-bold text-ink">{copy.issuerName}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-500">{copy.proofId}</dt>
            <dd className="mt-1 break-all font-bold text-ink">{certificate.public_slug}</dd>
          </div>
        </dl>
      </Card>

      <Card className="space-y-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{common.proofUrl}</p>
          <p className="mt-2 break-all text-sm font-bold text-ink">{proofUrl}</p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            {copy.share}
          </p>
        </div>
        <CopyButton value={proofUrl} label={common.copyProofUrl} copiedLabel={common.copiedProofUrl} />
      </Card>

      {hasOnChainSbt ? (
        <Card className="space-y-4 border-violet-200 bg-white">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-mint">{copy.advancedLabel}</p>
            <h2 className="mt-2 text-xl font-bold text-ink">{common.optionalTestnetSbt}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              {copy.sbtExplanation}
            </p>
          </div>
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-semibold text-slate-500">{copy.network}</dt>
              <dd className="mt-1 font-bold text-ink">{getNetworkName(certificate)}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">{copy.tokenId}</dt>
              <dd className="mt-1 font-bold text-ink">{certificate.token_id}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="font-semibold text-slate-500">{copy.contractAddress}</dt>
              <dd className="mt-1 space-y-1">
                <p className="font-bold text-ink">{shortenHash(certificate.contract_address ?? "")}</p>
                {contractUrl ? (
                  <a className="font-bold text-mint" href={contractUrl}>
                    {copy.viewContract}
                  </a>
                ) : null}
              </dd>
            </div>
            {certificate.tx_hash ? (
              <div className="sm:col-span-2">
                <dt className="font-semibold text-slate-500">{copy.mintTransaction}</dt>
                <dd className="mt-1 space-y-1">
                  <p className="font-bold text-ink">{shortenHash(certificate.tx_hash)}</p>
                  {txUrl ? (
                    <a className="font-bold text-mint" href={txUrl}>
                      {copy.viewTransaction}
                    </a>
                  ) : null}
                </dd>
              </div>
            ) : null}
            <div className="sm:col-span-2">
              <dt className="font-semibold text-slate-500">{copy.metadata}</dt>
              <dd className="mt-1 space-y-1">
                <a className="font-bold text-mint" href={tokenUri}>
                  {common.viewMetadata}
                </a>
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">{copy.locked}</dt>
              <dd className="mt-1 flex flex-wrap items-center gap-2 font-bold text-ink">
                {certificate.sbt_status === "unlocked" ? copy.checkContract : "true"}
                {certificate.sbt_status === "unlocked" ? null : <StatusPill tone="testnet">{copy.lockedBadge}</StatusPill>}
              </dd>
            </div>
          </dl>
        </Card>
      ) : (
        <Card className="space-y-4 border-cyan-200 bg-white">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-mint">{copy.metadataLabel}</p>
            <h2 className="mt-2 text-xl font-bold text-ink">{copy.metadataTitle}</h2>
          </div>
          <p className="text-sm leading-6 text-slate-700">
            {copy.metadataText}
          </p>
          <a className="inline-flex font-bold text-mint hover:text-ink" href={metadataUrl}>
            {common.viewMetadata}
          </a>
        </Card>
      )}

      <Card className="bg-paper/80 shadow-none">
        <p className="text-sm font-semibold text-slate-700">
          {copy.emailHidden}
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          {copy.proofMeaning}
        </p>
      </Card>

      <PublicFooter lang={lang} />
    </PageShell>
  );
}
