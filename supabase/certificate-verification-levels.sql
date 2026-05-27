-- Proof strength fields for certificates.
-- Run this once before deploying organizer approval controls.

alter table certificates
  add column if not exists verification_level text not null default 'checkin',
  add column if not exists approval_status text not null default 'approved';

update certificates
set verification_level = 'checkin'
where verification_level is null;

update certificates
set approval_status = 'approved'
where approval_status is null;

alter table certificates
  alter column verification_level set default 'checkin',
  alter column verification_level set not null,
  alter column approval_status set default 'approved',
  alter column approval_status set not null;

do $$
begin
  alter table certificates
    add constraint certificates_verification_level_check
    check (verification_level in ('checkin', 'organizer_approved', 'evidence_verified', 'onchain_sbt'));
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table certificates
    add constraint certificates_approval_status_check
    check (approval_status in ('approved', 'pending', 'rejected'));
exception
  when duplicate_object then null;
end $$;
