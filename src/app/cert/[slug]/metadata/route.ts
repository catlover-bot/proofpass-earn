import { NextResponse } from "next/server";
import { labelRole } from "@/lib/points";
import { getAppUrl, getMissingEnv, getSupabaseClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

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

  return NextResponse.json({
    name: `ProofPass Earn proof: ${event.title}`,
    description:
      "Off-chain public proof metadata for event participation or contribution. This metadata does not include participant email.",
    external_url: `${appUrl}/cert/${certificate.public_slug}`,
    attributes: [
      { trait_type: "Event title", value: event.title },
      { trait_type: "Certificate type", value: labelRole(certificate.certificate_type) },
      { trait_type: "Participant role", value: labelRole(participant.role) },
      { trait_type: "Status", value: labelRole(certificate.status) },
      { trait_type: "Issued date", value: certificate.issued_at }
    ]
  });
}
