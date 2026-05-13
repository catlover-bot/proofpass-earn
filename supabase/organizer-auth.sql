-- Organizer authentication support for Supabase Auth.
-- Run this once on existing databases before enabling organizer signup/login.

alter table organizer_members
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

create index if not exists organizer_members_user_id_idx
  on organizer_members(user_id);

create index if not exists organizer_members_email_idx
  on organizer_members(email);

create unique index if not exists organizer_members_org_user_id_unique
  on organizer_members(organization_id, user_id)
  where user_id is not null;

create unique index if not exists organizer_members_org_email_unique
  on organizer_members(organization_id, lower(email));
