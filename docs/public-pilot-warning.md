# Public Pilot Warning

ProofPass is currently suitable only for test and pilot data.

The admin area uses Supabase Auth for organizer login. Participant check-in and public proof pages remain account-free.

Before using real participant data at scale, add:

- Supabase Auth email/password settings for organizer login
- Organization membership checks
- Event ownership checks
- Strict RLS on all tables
- Admin-only participant access controls

Public certificate pages must not expose participant email.

Future SBT metadata must not include personal information.
