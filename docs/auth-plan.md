# Auth Plan

The MVP has no production authentication yet. Admin routes are useful for local pilots and product validation, but they are not production-secure.

## Admin Routes to Protect Before Production

- `/admin`
- `/admin/events`
- `/admin/events/new`
- `/admin/events/[eventId]`

## Recommended Path

Use Supabase Auth with email magic links for organizer login.

The first production auth pass should include:

- Organizer login
- Organization membership checks
- Event ownership checks
- RLS policies for all tables
- Safe admin-only participant access
- Safe admin-only point ledger access

## Ownership Model

Each event belongs to an organization. Organizer membership should be checked before allowing users to create events, view event participants, revoke certificates, or export event data.

## Public Access Model

Public routes should remain narrow:

- Certificate lookup by public slug
- Non-sensitive public profile summaries if implemented later

Participant email, organizer member email, internal point ledger details, and private organization settings should require authorized admin access.
