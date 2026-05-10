# Supabase Security

The MVP schema is designed for product validation. Before production use with real participant data, enable RLS and add policies for every table.

## RLS Requirements

RLS should be enabled for:

- `organizations`
- `organizer_members`
- `events`
- `participants`
- `certificates`
- `point_ledger`
- `badges`

Admin reads and writes should require an authenticated organizer who belongs to the event organization.

## Allowed Public Reads

Public access should be limited to:

- Valid certificate lookup by `public_slug`
- Non-sensitive public profile summary if implemented

Public certificate reads should return only the fields needed for the proof page.

## Data That Must Never Be Public

- Participant email
- Organizer member emails except to authorized admins
- Internal point ledger details unless intentionally exposed
- Private organization settings

## Suggested Policy Direction

- Public certificate policy: allow read where `status = 'valid'` and lookup uses `public_slug`.
- Revoked certificate policy: allow safe public status display without exposing private data.
- Participant policy: admin-only reads and writes, with limited insert support for public check-in.
- Point ledger policy: admin-only reads and server-controlled writes.
- Organization policy: admin-only access for private settings.

## Local and Pilot RLS Notes

- Event creation uses `insert(...).select("id").single()` so the `events` table needs both insert and select permission for the caller.
- If insert is allowed but select is blocked, the event may be written without returning an id to the app. The event creation page should show an error instead of redirecting.
- Duplicate check-in prevention is currently handled in application logic for the pilot.
- Future production data integrity should add a normalized email strategy and a unique constraint or index per event, such as a `normalized_email` column with `unique(event_id, normalized_email)`.
- Do not add a destructive migration to existing pilot data without a cleanup plan.
