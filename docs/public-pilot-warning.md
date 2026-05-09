# Public Pilot Warning

ProofPass Earn is currently suitable only for test and pilot data.

The admin area uses temporary HTTP Basic Auth. This is useful for a first deployment, but it is not a complete production security model.

Before using real participant data at scale, add:

- Supabase Auth for organizer login
- Organization membership checks
- Event ownership checks
- Strict RLS on all tables
- Admin-only participant access controls

Public certificate pages must not expose participant email.

Future SBT metadata must not include personal information.
