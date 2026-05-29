# ProofPass

ProofPass helps organizers turn event participation, speaking, contribution, and learning activity into shareable proof pages.

Organizers can create events, share QR check-in links, collect participant check-ins, issue proof pages, and confirm activity labels such as speaker, contributor, supporter, mentor, or winner.

Participants can use the default flow without a wallet. If needed, confirmed proofs can later be saved as digital proof records as an optional extension.

## MVP Scope

- Event creation and event list/detail views
- Supabase Auth organizer signup/login for admin pages
- QR check-in URLs for each event
- Participant check-in with name and email
- Public proof pages for attendance, speaking, contribution, and community activity
- Generated `/cert/[slug]/image` proof card images for sharing and page previews
- Organizer-confirmed proof labels for speaker, contributor, supporter, mentor, and winner
- Public proof collection pages keyed by a hashed profile value
- Supabase schema and local development seed data

This MVP is wallet-free and payment-free. It does not include wallet custody, participant-side chain actions, or automatic digital proof storage.

## Proof Levels

- QR check-in = attendance proof. A participant checked in through the event QR/check-in URL.
- Organizer confirmation = stronger proof. The organizer confirmed a role or contribution such as speaker, contributor, supporter, mentor, or winner.
- Evidence review = future stronger proof. Submitted information can be reviewed before a proof is strengthened.
- Digital proof storage = optional future extension. It is not automatic and should not contain personal information in public technical records.

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
8. Run `supabase/sbt-testnet-fields.sql` only if optional digital proof pilot fields are needed.
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
- `/cert/[slug]/image` generated proof card image
- `/cert/[slug]/metadata` structured proof information endpoint
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
- Personal information should not be included in future public technical records.

## Validation

```bash
npm run lint
npm run typecheck
npm run build
npm run contracts:compile
```
