# ProofPass Earn

ProofPass Earn is a proof and contribution tracking platform for research events, study groups, hackathons, and technical communities.

Organizers can create events, generate QR check-in links, collect participant check-ins, issue public proof pages, assign role-based off-chain points, and review participant proof status.

## MVP Scope

- Event creation and event list views
- QR check-in URLs for each event
- Participant check-in with name, email, and role
- Public certificate pages for attendance, speaker, contributor, and organizer proofs
- Off-chain point ledger entries based on participant role
- Safe public profile placeholder
- Supabase schema and local development seed data

This MVP is off-chain only. It does not include wallet login, payment functionality, blockchain dependencies, tradable token logic, or token exchange features. Future SBT support may be added as a non-transferable proof layer, but no chain interaction is implemented now.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase
- zod
- react-hook-form
- @hookform/resolvers
- react-qr-code
- nanoid
- date-fns
- lucide-react

## Local Setup

Use Node.js 20.9 or newer.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Set these environment variables in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Supabase Setup

1. Create a Supabase project.
2. Open the SQL editor.
3. Run `supabase/schema.sql`.
4. Run `supabase/seed.sql`.
5. Copy the project URL and anon key into `.env.local`.

## Routes

- `/` landing page
- `/admin` admin entry page
- `/admin/events` event list
- `/admin/events/new` event creation
- `/admin/events/[eventId]` event detail, QR code, and participants
- `/checkin/[eventCode]` participant check-in
- `/cert/[slug]` public certificate page
- `/profile/[emailHash]` public profile placeholder

## Happy Path

1. Visit `/admin/events/new`.
2. Create an event.
3. Open the event detail page.
4. Share or scan the QR check-in URL.
5. Submit participant name, email, and role.
6. Confirm the redirect to the public certificate page.
7. Return to the event detail page to review participant status and points.

## Privacy Notes

- Public certificate pages do not expose participant email.
- Public certificate pages do not expose internal point ledger details.
- The public profile route is a placeholder and does not expose raw email.
- Admin routes are not production-secure until authentication, authorization, ownership checks, and RLS policies are added.
- No personal information is intended for future on-chain metadata.

## Validation

```bash
npm run lint
npm run typecheck
npm run build
```
