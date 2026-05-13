# Manual QA Checklist

Use this checklist before pilot sharing and after check-in changes.

## Core Routes

- Open `/setup` and confirm required variables show set or missing without values.
- Open `/admin/events` while logged out and confirm it redirects to `/login`.
- Open `/admin/events/new` and create an event.
- Open `/admin/events/[eventId]` and confirm QR code, copyable check-in URL, organizer copy, participant list, and pilot checklist appear.
- Open `/checkin/[eventCode]` and confirm event details and privacy explanation appear.
- Open `/cert/[slug]` and confirm proof details, copyable proof URL, privacy note, and footer links appear.

## Check-In De-Duplication

1. Create a new event.
2. Open the generated check-in URL.
3. Check in once with `dimension012@gmail.com`.
4. Confirm redirect to `/cert/<slug>`.
5. Open the same check-in URL again.
6. Check in with `dimension012@gmail.com`.
7. Confirm redirect to the existing certificate or no duplicate is created.
8. Open the same check-in URL again.
9. Check in with `Dimension012@Gmail.com`.
10. Confirm it resolves to the same participant and certificate.
11. Open the same check-in URL again.
12. Check in with leading and trailing spaces around the same email.
13. Confirm it resolves to the same participant and certificate.

Expected behavior:

- No duplicate participant row for the same event and normalized email.
- No duplicate certificate for the same participant and event.
- No duplicate check-in point entry for the same participant and event.
- Repeated check-in still feels successful by returning the participant to a certificate page.

## Invalid Check-In Code

1. Open `/checkin/not-a-real-code`.
2. Confirm a safe invalid check-in message appears.

## Public Certificate Privacy

1. Open the public certificate page.
2. Confirm the participant name, event title, certificate type, event date, status, and proof ID appear.
3. Confirm participant email does not appear.

## Vercel Smoke Test

- `/` loads.
- `/privacy`, `/terms`, and `/contact` load.
- `/admin/events` requires organizer login.
- `/admin/events/new` creates an event after authentication.
- `/checkin/[eventCode]` is public.
- `/cert/[slug]` is public and does not expose participant email.
