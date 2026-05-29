-- ProofPass organizer-scoped RLS policies.
--
-- Run after:
-- 1. supabase/schema.sql
-- 2. supabase/organizer-auth.sql
-- 3. any optional schema migrations used by the app
--
-- Authenticated organizers can read or operate only rows connected to
-- organizer_members.user_id = auth.uid().

create or replace function public.is_authenticated_organizer_member(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    auth.uid() is not null
    and exists (
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
  select
    auth.uid() is not null
    and exists (
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

-- Remove legacy policy names from earlier pilot SQL exports before creating the
-- current canonical policy names below.
drop policy if exists "organizer_members_authenticated_select" on public.organizer_members;
drop policy if exists "organizer_members_authenticated_insert" on public.organizer_members;
drop policy if exists "organizer_members_authenticated_update" on public.organizer_members;
drop policy if exists "organizations_authenticated_select" on public.organizations;
drop policy if exists "events_authenticated_select" on public.events;
drop policy if exists "events_authenticated_insert" on public.events;
drop policy if exists "participants_authenticated_select" on public.participants;
drop policy if exists "participants_authenticated_update" on public.participants;
drop policy if exists "certificates_authenticated_select" on public.certificates;
drop policy if exists "certificates_authenticated_insert" on public.certificates;
drop policy if exists "certificates_authenticated_update" on public.certificates;
drop policy if exists "badges_authenticated_select" on public.badges;
drop policy if exists "badges_authenticated_insert" on public.badges;
drop policy if exists "badges_authenticated_delete" on public.badges;

-- organizer_members: SELECT own membership
drop policy if exists "organizer_members_select_own" on public.organizer_members;
create policy "organizer_members_select_own"
on public.organizer_members
for select
to authenticated
using (organizer_members.user_id = auth.uid());

-- organizer_members: INSERT own membership
drop policy if exists "organizer_members_insert_own" on public.organizer_members;
create policy "organizer_members_insert_own"
on public.organizer_members
for insert
to authenticated
with check (organizer_members.user_id = auth.uid());

-- organizer_members: UPDATE own membership
drop policy if exists "organizer_members_update_own" on public.organizer_members;
create policy "organizer_members_update_own"
on public.organizer_members
for update
to authenticated
using (organizer_members.user_id = auth.uid())
with check (organizer_members.user_id = auth.uid());

-- organizations: SELECT own organization
drop policy if exists "organizations_select_own" on public.organizations;
create policy "organizations_select_own"
on public.organizations
for select
to authenticated
using (public.is_authenticated_organizer_member(organizations.id));

-- events: SELECT own events
drop policy if exists "events_select_own" on public.events;
create policy "events_select_own"
on public.events
for select
to authenticated
using (public.is_authenticated_organizer_member(events.organization_id));

-- events: INSERT own events
drop policy if exists "events_insert_own" on public.events;
create policy "events_insert_own"
on public.events
for insert
to authenticated
with check (public.is_authenticated_organizer_member(events.organization_id));

-- participants: SELECT own event participants
drop policy if exists "participants_select_own_event" on public.participants;
create policy "participants_select_own_event"
on public.participants
for select
to authenticated
using (public.organizer_can_access_event(participants.event_id));

-- participants: UPDATE own event participants
drop policy if exists "participants_update_own_event" on public.participants;
create policy "participants_update_own_event"
on public.participants
for update
to authenticated
using (public.organizer_can_access_event(participants.event_id))
with check (public.organizer_can_access_event(participants.event_id));

-- certificates: SELECT own event certificates
drop policy if exists "certificates_select_own_event" on public.certificates;
create policy "certificates_select_own_event"
on public.certificates
for select
to authenticated
using (public.organizer_can_access_event(certificates.event_id));

-- certificates: INSERT own event certificates
drop policy if exists "certificates_insert_own_event" on public.certificates;
create policy "certificates_insert_own_event"
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

-- certificates: UPDATE own event certificates
drop policy if exists "certificates_update_own_event" on public.certificates;
create policy "certificates_update_own_event"
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

-- badges: SELECT own event badges
drop policy if exists "badges_select_own_event" on public.badges;
create policy "badges_select_own_event"
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

-- badges: INSERT own event badges
drop policy if exists "badges_insert_own_event" on public.badges;
create policy "badges_insert_own_event"
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

-- badges: DELETE own event badges
drop policy if exists "badges_delete_own_event" on public.badges;
create policy "badges_delete_own_event"
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
