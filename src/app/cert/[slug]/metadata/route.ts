import { NextResponse } from "next/server";
import { getProofAchievementBadges } from "@/lib/achievements";
import { labelRole } from "@/lib/achievement-ledger";
import { labelProofType } from "@/lib/proof-types";
import { getAppUrl, getMissingEnv, getSupabaseClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

const PUBLIC_METADATA_BASE_URL = "https://proofpass-earn.vercel.app";

export async function GET(
  _request: Request,
  {
    params
  }: {
    params: Promise<{ slug: string }>;
  }
) {
  const { slug } = await params;
  const missing = getMissingEnv();

  if (missing.length > 0) {
    return NextResponse.json({ error: "Proof metadata is not configured." }, { status: 503 });
  }

  const supabase = getSupabaseClient();
  const appUrl = getAppUrl();

  if (!supabase || !appUrl) {
    return NextResponse.json({ error: "Proof metadata is not configured." }, { status: 503 });
  }

  const { data: certificate, error: certificateError } = await supabase
    .from("certificates")
    .select("event_id,participant_id,public_slug,certificate_type,status,issued_at")
    .eq("public_slug", slug)
    .maybeSingle();

  if (certificateError) {
    return NextResponse.json({ error: "Unable to load proof metadata." }, { status: 500 });
  }

  if (!certificate) {
    return NextResponse.json({ error: "Proof metadata not found." }, { status: 404 });
  }

  const [{ data: event, error: eventError }, { data: participant, error: participantError }] =
    await Promise.all([
      supabase.from("events").select("title").eq("id", certificate.event_id).maybeSingle(),
      supabase.from("participants").select("role").eq("id", certificate.participant_id).maybeSingle()
    ]);

  if (eventError || participantError || !event || !participant) {
    return NextResponse.json({ error: "Unable to load proof metadata." }, { status: 500 });
  }

  const achievements = getProofAchievementBadges("en", {
    certificateType: certificate.certificate_type,
    participantRole: participant.role,
    includeEarlySupporter: true
  });
  const proofImageUrl = `${PUBLIC_METADATA_BASE_URL}/cert/${certificate.public_slug}/image`;

  return NextResponse.json({
    name: `ProofPass proof: ${event.title}`,
    description:
      "Off-chain public proof metadata for event participation, achievement, or community contribution. Private contact details are not included.",
    external_url: `${appUrl}/cert/${certificate.public_slug}`,
    image: proofImageUrl,
    attributes: [
      { trait_type: "Event title", value: event.title },
      { trait_type: "Certificate type", value: labelProofType("en", certificate.certificate_type) },
      { trait_type: "Participant role", value: labelRole(participant.role) },
      { trait_type: "Proof labels", value: achievements.map((achievement) => achievement.label).join(", ") },
      { trait_type: "Proof media", value: "NFT/SBT-style proof card image" },
      { trait_type: "Status", value: labelRole(certificate.status) },
      { trait_type: "Issued date", value: certificate.issued_at }
    ]
  });
}
