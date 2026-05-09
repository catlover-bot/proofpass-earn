insert into organizations (id, name, contact_email)
values (
  '00000000-0000-4000-8000-000000000001',
  'ProofPass Earn Demo Organization',
  'organizer@example.invalid'
)
on conflict (id) do nothing;

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
on conflict (id) do nothing;
