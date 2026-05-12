-- Optional pilot fields for manually attached testnet SBT proof data.
-- This migration is non-destructive. Existing certificates do not need SBT data.
-- Some pilot databases may already have chain_id as text; this file does not alter existing column types.

alter table certificates add column if not exists chain_id integer;
alter table certificates add column if not exists chain_name text;
alter table certificates add column if not exists contract_address text;
alter table certificates add column if not exists token_id text;
alter table certificates add column if not exists tx_hash text;
alter table certificates add column if not exists metadata_url text;
alter table certificates add column if not exists token_uri text;
alter table certificates add column if not exists minted_at timestamptz;
alter table certificates add column if not exists sbt_status text;
