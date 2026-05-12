create extension if not exists "pgcrypto";

do $$
begin
  create type participant_role as enum ('attendee', 'speaker', 'contributor', 'organizer');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type certificate_type as enum ('attendance', 'speaker', 'contributor', 'organizer');
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
create index if not exists point_ledger_event_id_idx on point_ledger(event_id);
create index if not exists point_ledger_participant_id_idx on point_ledger(participant_id);
