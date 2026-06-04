-- Safe public read surface for /community/[organizationId].
--
-- These views expose only community/profile fields that are already intended for
-- public proof pages or aggregate community achievements. They intentionally do
-- not include organizer contact email, participant email, invitations, or ledger
-- details.

create or replace view public.community_public_organizations as
select
  organizations.id,
  organizations.name,
  organizations.created_at
from public.organizations organizations;

create or replace view public.community_public_events as
select
  events.id,
  events.organization_id,
  events.title,
  events.starts_at,
  events.checkin_code,
  events.checkin_mode,
  count(distinct participants.id)::integer as participant_count,
  count(distinct certificates.id)::integer as proof_count
from public.events events
left join public.participants participants
  on participants.event_id = events.id
left join public.certificates certificates
  on certificates.event_id = events.id
  and certificates.status = 'valid'
group by
  events.id,
  events.organization_id,
  events.title,
  events.starts_at,
  events.checkin_code,
  events.checkin_mode;

create or replace view public.community_public_proofs as
select
  certificates.id,
  events.organization_id,
  events.title as event_title,
  certificates.public_slug,
  participants.name as participant_name,
  (
    select badges.badge_type
    from public.badges badges
    where badges.participant_id = participants.id
      and badges.badge_type in ('speaker', 'contributor', 'supporter', 'mentor', 'winner')
    order by badges.created_at desc
    limit 1
  ) as proof_label,
  certificates.certificate_type,
  certificates.verification_level,
  certificates.approval_status,
  certificates.issued_at
from public.certificates certificates
join public.events events
  on events.id = certificates.event_id
join public.participants participants
  on participants.id = certificates.participant_id
where certificates.status = 'valid';

create or replace view public.community_public_label_counts as
select
  labeled_proofs.organization_id,
  labeled_proofs.proof_label,
  count(*)::integer as proof_count
from (
  select
    events.organization_id,
    coalesce(
      (
        select badges.badge_type
        from public.badges badges
        where badges.participant_id = participants.id
          and badges.badge_type in ('speaker', 'contributor', 'supporter', 'mentor', 'winner')
        order by badges.created_at desc
        limit 1
      ),
      case
        when certificates.certificate_type in ('speaking', 'speaker') then 'speaker'
        when certificates.certificate_type in ('contribution', 'contributor') then 'contributor'
        else 'participation'
      end
    ) as proof_label
  from public.certificates certificates
  join public.events events
    on events.id = certificates.event_id
  join public.participants participants
    on participants.id = certificates.participant_id
  where certificates.status = 'valid'
) labeled_proofs
group by labeled_proofs.organization_id, labeled_proofs.proof_label;

revoke all on public.community_public_organizations from public;
revoke all on public.community_public_events from public;
revoke all on public.community_public_proofs from public;
revoke all on public.community_public_label_counts from public;

grant select on public.community_public_organizations to anon, authenticated;
grant select on public.community_public_events to anon, authenticated;
grant select on public.community_public_proofs to anon, authenticated;
grant select on public.community_public_label_counts to anon, authenticated;
