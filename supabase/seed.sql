insert into organizations (id, name, contact_email)
values (
  '00000000-0000-4000-8000-000000000001',
  'デモ主催者 / Demo Organizer',
  'demo-organizer@example.com'
)
on conflict (id) do update set
  name = excluded.name,
  contact_email = excluded.contact_email;

insert into organizer_members (organization_id, email, role)
values (
  '00000000-0000-4000-8000-000000000001',
  'demo-organizer@example.com',
  'owner'
)
on conflict do nothing;

insert into events (
  id,
  organization_id,
  title,
  description,
  location,
  starts_at,
  ends_at,
  checkin_code
)
values (
  '00000000-0000-4000-8000-000000000101',
  '00000000-0000-4000-8000-000000000001',
  'Demo Research Study Group',
  'A local development event for testing QR check-in and public proof pages.',
  'Local development',
  now() + interval '7 days',
  now() + interval '7 days 2 hours',
  'demo-study-group'
)
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  location = excluded.location,
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at,
  checkin_code = excluded.checkin_code;

insert into participants (
  id,
  event_id,
  name,
  email,
  role
)
values (
  '00000000-0000-4000-8000-000000000201',
  '00000000-0000-4000-8000-000000000101',
  'デモ参加者 / Demo Participant',
  'demo-participant@example.com',
  'speaker'
)
on conflict (id) do update set
  name = excluded.name,
  email = excluded.email,
  role = excluded.role;

insert into certificates (
  id,
  event_id,
  participant_id,
  public_slug,
  certificate_type,
  verification_level,
  approval_status,
  status
)
values (
  '00000000-0000-4000-8000-000000000301',
  '00000000-0000-4000-8000-000000000101',
  '00000000-0000-4000-8000-000000000201',
  'proof_xZ0Nb0iY9yMUf1',
  'speaking',
  'organizer_approved',
  'approved',
  'valid'
)
on conflict (event_id, participant_id) do update set
  public_slug = excluded.public_slug,
  certificate_type = excluded.certificate_type,
  verification_level = excluded.verification_level,
  approval_status = excluded.approval_status,
  status = excluded.status;

delete from badges
where participant_id = '00000000-0000-4000-8000-000000000201'
  and badge_type in ('speaker', 'contributor', 'supporter', 'mentor', 'winner');

insert into badges (
  participant_id,
  badge_type,
  label,
  description
)
values (
  '00000000-0000-4000-8000-000000000201',
  'speaker',
  'Speaker',
  'Shared knowledge with the community.'
);
