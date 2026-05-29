# ProofPass

ProofPass is a trusted event and activity proof product for research events, study groups, hackathons, and technical communities.

Organizers can create events, generate QR check-in links, collect participant check-ins, issue public proof pages with Proof Cards, and add organizer-approved proof labels.

ProofPass focuses on durable proof records. SBT/NFT support is treated as an optional future extension for approved proofs.

## MVP Scope

- Event creation and event list/detail views
- Supabase Auth organizer signup/login for admin pages
- QR check-in URLs for each event
- Participant check-in with name and email
- Public proof pages for attendance, speaking, contribution, and community activity
- Generated `/cert/[slug]/image` proof cards for metadata and page previews
- Organizer-approved proof labels for speaker, contributor, supporter, mentor, and winner
- Public proof collection pages keyed by a hashed profile value
- Supabase schema and local development seed data

This MVP is wallet-free and payment-free. It does not include wallet custody, participant-side chain actions, or automatic SBT/NFT issuing.

## Proof Levels

- QR check-in = attendance proof. A participant checked in through the event QR/check-in URL.
- Organizer approval = stronger proof. The organizer confirmed a role or contribution such as speaker, contributor, supporter, mentor, or winner.
- Evidence verification = future stronger proof. Submitted evidence can be reviewed before a proof is strengthened.
- SBT/NFT = optional future extension. It is not issued automatically and should not contain personal information on-chain.

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
4. Run `supabase/organizer-auth.sql`.
5. Run `supabase/invitations.sql` if invite-only check-in is used.
6. Run `supabase/certificate-proof-types.sql` for existing pilot databases that predate the current certificate types.
7. Run `supabase/certificate-verification-levels.sql` for existing pilot databases that predate proof strength fields.
8. Run `supabase/sbt-testnet-fields.sql` only if optional testnet SBT fields are needed.
9. Run `supabase/organizer-proof-rls-policies.sql` after the schema is ready.
10. Run `supabase/seed.sql` if demo data is useful.
11. Copy the project URL and anon key into `.env.local`.

## Routes

- `/` landing page
- `/pilot` public pilot page
- `/login` organizer login
- `/signup` organizer signup
- `/admin` admin entry page
- `/admin/events` event list
- `/admin/events/new` event creation
- `/admin/events/[eventId]` event detail, QR code, and participants
- `/checkin/[eventCode]` participant check-in
- `/cert/[slug]` public certificate page
- `/cert/[slug]/image` generated Proof Card image
- `/cert/[slug]/metadata` structured public proof metadata
- `/profile/[emailHash]` public proof collection

## Happy Path

1. Visit `/admin/events/new`.
2. Create an event.
3. Open the event detail page.
4. Share or scan the QR check-in URL.
5. Submit participant name, email, and role.
6. Confirm the redirect to the public certificate page.
7. Return to the event detail page to review participant status and proof labels.

## Privacy Notes

- Public certificate pages do not expose participant email.
- Public certificate pages do not expose internal ledger details.
- The public proof collection route does not expose raw email.
- Admin routes require organizer login. Participant check-in and public proof pages remain account-free.
- No personal information is intended for future on-chain metadata.

## Validation

```bash
npm run lint
npm run typecheck
npm run build
npm run contracts:compile
```
