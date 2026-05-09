# Deployment on Vercel

## Required Environment Variables

Set these in the Vercel project before the first production build:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_URL=https://your-production-domain.example
```

`NEXT_PUBLIC_APP_URL` must match the production domain so generated QR check-in URLs point to the deployed app.

## Supabase Setup Order

1. Create or select the production Supabase project.
2. Run `supabase/schema.sql`.
3. Run `supabase/seed.sql` only if a demo event is useful for the deployment.
4. Confirm the `events`, `participants`, `certificates`, and `point_ledger` tables exist.
5. Add production RLS policies before using admin routes with real participant data.

## Vercel Import Steps

1. Import the GitHub repository in Vercel.
2. Select the default Next.js settings.
3. Add the required environment variables.
4. Deploy.
5. Confirm the production domain is the same value used for `NEXT_PUBLIC_APP_URL`.

## Production Smoke Test Checklist

- Landing page loads.
- `/admin/events` loads and either shows events or a clear empty state.
- `/admin/events/new` creates an event.
- Event detail page displays a QR code and check-in URL.
- Check-in URL accepts participant details and redirects to a certificate page.
- Certificate page does not expose participant email.
- Invalid check-in and certificate URLs show safe fallback states.

Do not use production participant data until authentication, ownership checks, and RLS policies are in place.
