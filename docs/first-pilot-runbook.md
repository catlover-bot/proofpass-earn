# First Pilot Runbook

Use this runbook for a small live pilot event.

## Before Event

- Confirm `/setup` shows the required environment variables as set.
- Create the event in `/admin/events/new`.
- Open the event detail page.
- Copy the check-in URL.
- Copy the organizer instruction text from the event detail page.
- Test one check-in with non-sensitive pilot data.
- Open the generated certificate page and confirm participant email is not displayed.

## During Event

- Share the check-in URL or QR code with participants.
- Paste the organizer instruction text into Slack, Discord, email, or the event chat.
- Keep `/admin/events/[eventId]` open to confirm check-ins.
- Check participant name, role, checked-in time, certificate status, certificate link, and points.
- If someone checks in twice, confirm the participant list does not create a duplicate row.

## After Event

- Spot-check several certificate pages.
- Confirm public certificate pages do not show participant email.
- Record participant count and any duplicate handling issues.
- Capture organizer notes while the workflow is fresh.

## URL To Share

Share the event-specific `/checkin/[eventCode]` URL from the event detail page. Certificate URLs can be shared by participants after check-in.

## Screenshots To Capture

- Event detail page with QR code and check-in URL.
- Check-in page before submitting.
- Certificate page after check-in.
- Admin participant list after several check-ins.
- Duplicate check-in result showing no duplicate participant row.

## Participant Feedback Questions

- Was check-in easy to understand?
- Did the certificate page feel useful?
- Was the email privacy explanation clear?
- Would you share the proof URL publicly?
- What information should be added or removed from the certificate page?

## Organizer Feedback Questions

- Was event setup clear?
- Was the organizer copy useful?
- Was the participant list easy to scan during the event?
- Did the role and points model fit the event?
- What would need to improve before a larger pilot?
- 「次回から1イベント3万円なら使いますか？」
