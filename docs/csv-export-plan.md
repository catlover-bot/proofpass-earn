# CSV Export Plan

CSV export is planned for a later admin-only release. Do not implement CSV export in the MVP.

## Future Admin-Only Export

The export should be available only to authenticated organizers with access to the event organization.

Planned fields:

- `participant_name`
- `participant_role`
- `checked_in_at`
- `certificate_status`
- `certificate_slug`
- `points`
- `event_title`

## Privacy Constraints

- CSV export must be admin-only.
- Public pages must not expose participant email.
- Email export should be a separate explicit admin-only option.
- Export actions should be logged once production audit logging exists.

## Open Decisions

- Whether exports should include revoked certificates by default.
- Whether organizers need filtered exports by role.
- Whether point totals should be exported as event-only totals or lifetime totals.
