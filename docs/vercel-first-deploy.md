# Vercel First Deploy

Use this checklist for the first pilot deployment.

## Supabase

1. Create or select a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Run `supabase/policies.local.sql` if local or pilot policies are needed.
4. Use only the anon or publishable key for `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
5. Never use the `service_role` key or any secret key in `NEXT_PUBLIC` variables.

## Vercel

1. Import the GitHub repository into Vercel.
2. Set the framework preset to Next.js.
3. Set the required environment variables.
4. Deploy.

Required Vercel environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_URL=
```

## Smoke Test

- `/` loads.
- `/setup` shows all required variables as `Set` or `Missing` without exposing values.
- `/admin/events` redirects logged-out users to `/login`.
- `/admin/events/new` can create an event after auth.
- `/checkin/[eventCode]` is public.
- `/cert/[slug]` is public and does not expose participant email.

Use test or pilot data only until strict RLS policies and operational security review are in place.
