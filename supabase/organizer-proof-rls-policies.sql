-- Organizer-scoped RLS policies for ProofPass admin proof management.
-- These policies grant authenticated organizers access only to rows connected
-- to organizations/events where organizer_members.user_id = auth.uid().

create or replace function public.is_authenticated_organizer_member(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organizer_members organizer_member
    where organizer_member.organization_id = target_organization_id
      and organizer_member.user_id = auth.uid()
  );
$$;

create or replace function public.organizer_can_access_event(target_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.events event_record
    where event_record.id = target_event_id
      and public.is_authenticated_organizer_member(event_record.organization_id)
  );
$$;

revoke all on function public.is_authenticated_organizer_member(uuid) from public;
revoke all on function public.organizer_can_access_event(uuid) from public;
grant execute on function public.is_authenticated_organizer_member(uuid) to authenticated;
grant execute on function public.organizer_can_access_event(uuid) to authenticated;

alter table public.organizer_members enable row level security;
alter table public.organizations enable row level security;
alter table public.events enable row level security;
alter table public.participants enable row level security;
alter table public.certificates enable row level security;
alter table public.badges enable row level security;

drop policy if exists "organizer_members_authenticated_select" on public.organizer_members;
create policy "organizer_members_authenticated_select"
on public.organizer_members
for select
to authenticated
using (organizer_members.user_id = auth.uid());

drop policy if exists "organizer_members_authenticated_insert" on public.organizer_members;
create policy "organizer_members_authenticated_insert"
on public.organizer_members
for insert
to authenticated
with check (organizer_members.user_id = auth.uid());

drop policy if exists "organizer_members_authenticated_update" on public.organizer_members;
create policy "organizer_members_authenticated_update"
on public.organizer_members
for update
to authenticated
using (organizer_members.user_id = auth.uid())
with check (
  organizer_members.user_id = auth.uid()
  and public.is_authenticated_organizer_member(organizer_members.organization_id)
);

drop policy if exists "organizations_authenticated_select" on public.organizations;
create policy "organizations_authenticated_select"
on public.organizations
for select
to authenticated
using (public.is_authenticated_organizer_member(organizations.id));

drop policy if exists "events_authenticated_select" on public.events;
create policy "events_authenticated_select"
on public.events
for select
to authenticated
using (public.is_authenticated_organizer_member(events.organization_id));

drop policy if exists "events_authenticated_insert" on public.events;
create policy "events_authenticated_insert"
on public.events
for insert
to authenticated
with check (public.is_authenticated_organizer_member(events.organization_id));

drop policy if exists "participants_authenticated_select" on public.participants;
create policy "participants_authenticated_select"
on public.participants
for select
to authenticated
using (public.organizer_can_access_event(participants.event_id));

drop policy if exists "participants_authenticated_update" on public.participants;
create policy "participants_authenticated_update"
on public.participants
for update
to authenticated
using (public.organizer_can_access_event(participants.event_id))
with check (public.organizer_can_access_event(participants.event_id));

drop policy if exists "certificates_authenticated_select" on public.certificates;
create policy "certificates_authenticated_select"
on public.certificates
for select
to authenticated
using (public.organizer_can_access_event(certificates.event_id));

drop policy if exists "certificates_authenticated_insert" on public.certificates;
create policy "certificates_authenticated_insert"
on public.certificates
for insert
to authenticated
with check (
  public.organizer_can_access_event(certificates.event_id)
  and exists (
    select 1
    from public.participants participant
    where participant.id = certificates.participant_id
      and participant.event_id = certificates.event_id
  )
);

drop policy if exists "certificates_authenticated_update" on public.certificates;
create policy "certificates_authenticated_update"
on public.certificates
for update
to authenticated
using (public.organizer_can_access_event(certificates.event_id))
with check (
  public.organizer_can_access_event(certificates.event_id)
  and exists (
    select 1
    from public.participants participant
    where participant.id = certificates.participant_id
      and participant.event_id = certificates.event_id
  )
);

drop policy if exists "badges_authenticated_select" on public.badges;
create policy "badges_authenticated_select"
on public.badges
for select
to authenticated
using (
  exists (
    select 1
    from public.participants participant
    where participant.id = badges.participant_id
      and public.organizer_can_access_event(participant.event_id)
  )
);

drop policy if exists "badges_authenticated_insert" on public.badges;
create policy "badges_authenticated_insert"
on public.badges
for insert
to authenticated
with check (
  exists (
    select 1
    from public.participants participant
    where participant.id = badges.participant_id
      and public.organizer_can_access_event(participant.event_id)
  )
);

drop policy if exists "badges_authenticated_delete" on public.badges;
create policy "badges_authenticated_delete"
on public.badges
for delete
to authenticated
using (
  exists (
    select 1
    from public.participants participant
    where participant.id = badges.participant_id
      and public.organizer_can_access_event(participant.event_id)
  )
);
