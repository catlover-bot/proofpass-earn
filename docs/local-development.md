# Local Development

## Prerequisites

- Node.js 20.9 or newer
- npm
- A Supabase project for local MVP data

## Setup

```bash
npm install
cp .env.example .env.local
```

Create a Supabase project, then set:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Environment Troubleshooting

- `.env.local` must be in the project root, next to `package.json`.
- Restart `npm run dev` after editing `.env.local`; Next.js reads local environment values when the dev server starts.
- `NEXT_PUBLIC_APP_URL` should match the local port. The current local app URL is `http://localhost:3001`.
- Open `/setup` to confirm the required variables show `Set` without exposing their values.

## Database

Run the SQL files in this order from the Supabase SQL editor:

```bash
supabase/schema.sql
supabase/seed.sql
```

The seed creates one demo organization and one demo event with the check-in code `demo-study-group`.

## Validation Commands

```bash
npm run lint
npm run typecheck
npm run build
```

## Run the App

```bash
npm run dev
```

Expected localhost URLs:

- `http://localhost:3000/`
- `http://localhost:3000/admin`
- `http://localhost:3000/admin/events`
- `http://localhost:3000/admin/events/new`
- `http://localhost:3000/checkin/demo-study-group`

## Local Happy Path

1. Open `http://localhost:3000/admin/events`.
2. Confirm the seeded event appears.
3. Open the event detail page.
4. Open or scan the check-in URL.
5. Submit a participant check-in.
6. Confirm the certificate page loads.
7. Return to the event detail page and confirm participant status and points.
