alter table events
  add column if not exists checkin_mode text not null default 'public';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'events_checkin_mode_check'
  ) then
    alter table events
      add constraint events_checkin_mode_check
      check (checkin_mode in ('public', 'invite_only'));
  end if;
end $$;

create table if not exists event_invitations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  email text not null,
  normalized_email text not null,
  name text,
  role participant_role,
  invite_token text not null unique,
  status text not null default 'invited' check (status in ('invited', 'checked_in', 'revoked')),
  invited_at timestamptz not null default now(),
  checked_in_at timestamptz,
  participant_id uuid references participants(id) on delete set null,
  certificate_id uuid references certificates(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (event_id, normalized_email)
);

create index if not exists event_invitations_event_id_idx on event_invitations(event_id);
create index if not exists event_invitations_invite_token_idx on event_invitations(invite_token);
create index if not exists event_invitations_normalized_email_idx on event_invitations(event_id, normalized_email);
