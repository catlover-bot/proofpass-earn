create extension if not exists "pgcrypto";

do $$
begin
  create type participant_role as enum ('attendee', 'speaker', 'contributor', 'organizer');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type certificate_type as enum (
    'attendance',
    'speaking',
    'contribution',
    'organizing',
    'speaker',
    'contributor',
    'organizer'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type certificate_status as enum ('valid', 'revoked');
exception
  when duplicate_object then null;
end $$;

create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_email text,
  created_at timestamptz not null default now()
);

create table if not exists organizer_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'owner',
  created_at timestamptz not null default now()
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete set null,
  title text not null,
  description text,
  location text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  checkin_code text not null unique,
  checkin_mode text not null default 'public' check (checkin_mode in ('public', 'invite_only')),
  created_at timestamptz not null default now()
);

create table if not exists participants (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  name text not null,
  email text not null,
  role participant_role not null default 'attendee',
  checked_in_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists certificates (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  participant_id uuid not null references participants(id) on delete cascade,
  public_slug text not null unique,
  certificate_type certificate_type not null,
  status certificate_status not null default 'valid',
  issued_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  chain_id integer,
  chain_name text,
  contract_address text,
  token_id text,
  tx_hash text,
  metadata_url text,
  token_uri text,
  minted_at timestamptz,
  sbt_status text,
  unique (event_id, participant_id)
);

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

create table if not exists point_ledger (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references participants(id) on delete cascade,
  event_id uuid not null references events(id) on delete cascade,
  action_type text not null,
  points integer not null check (points >= 0),
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists badges (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references participants(id) on delete cascade,
  badge_type text not null,
  label text not null,
  description text,
  created_at timestamptz not null default now()
);

create index if not exists events_checkin_code_idx on events(checkin_code);
create index if not exists certificates_public_slug_idx on certificates(public_slug);
create index if not exists participants_event_id_idx on participants(event_id);
create index if not exists event_invitations_event_id_idx on event_invitations(event_id);
create index if not exists event_invitations_invite_token_idx on event_invitations(invite_token);
create index if not exists event_invitations_normalized_email_idx on event_invitations(event_id, normalized_email);
create index if not exists point_ledger_event_id_idx on point_ledger(event_id);
create index if not exists point_ledger_participant_id_idx on point_ledger(participant_id);
create index if not exists organizer_members_user_id_idx on organizer_members(user_id);
create index if not exists organizer_members_email_idx on organizer_members(email);
