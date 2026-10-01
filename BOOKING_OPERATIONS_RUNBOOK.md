# Booking operations runbook

Use this runbook when deploying or operating the Classes booking, Waitlist, check-in, and attendance workflow. All Session times are interpreted in `Asia/Kuala_Lumpur`.

## Before deployment

1. Confirm the target environment and database. Do not paste credentials into tickets, chat, screenshots, or logs.
2. Run the full local verification:

   ```bash
   pnpm verify
   ```

3. Review the pending migrations. The required order is:
   1. `0006_booking_lifecycle_integrity.sql`
   2. `0007_session_operations_audit.sql`
4. Obtain explicit approval before running a migration against any shared database. `pnpm verify` and builds do **not** apply migrations.
5. After approval, apply migrations through the normal environment-specific deployment process:

   ```bash
   pnpm db:migrate
   ```

6. Deploy the application only after migration success is confirmed. Both migrations are additive; do not attempt to “roll back” by dropping their columns or tables while deployed code may still use them. Prefer fixing forward or restoring the complete database from an approved backup.

## Post-deployment smoke test

Use a disposable test participant and a future test Session where possible.

1. Open `/classes` signed out and confirm published future Sessions render with Kuala Lumpur dates, locations, and availability.
2. Start one booking, complete sign-in/profile setup, and confirm the selected Session resumes once.
3. Verify the member receipt and `/dashboard` show the same Session; download its calendar file.
4. Cancel the Booking and confirm it leaves the active dashboard. If a test Waitlist entry exists, confirm the earliest entry is promoted once.
5. In `/admin`, confirm the Session appears in the correct operations queue and opens directly.
6. On the Session page, verify the roster, active Waitlist, check-in window, notification outcomes, and CSV export.
7. For an ended test Session, record attendance, finalize it, confirm the remaining expected people become no-shows, then reopen with a reason if more testing is required.
8. Open `/admin/reports` and confirm the Session appears in the selected date range and the programme CSV downloads.

## Booking or capacity incident

**Symptoms:** a Person cannot book despite visible space, a full Session accepts excess active Bookings, or a Waitlist promotion looks out of order.

1. Pause manual promotion, transfer, and capacity edits for the affected Session.
2. Capture the Session URL, time, displayed capacity, active Booking count, active Waitlist count, and the exact error. Do not include contact details in shared incident notes.
3. Check whether the Session is scheduled, future, unfinalized, and attached to active Course/Class records.
4. Check active occupancy using confirmed plus attended Bookings. Cancelled and no-show records do not consume capacity.
5. Review Booking status history and the operational audit trail before making a correction.
6. Use the existing staff correction, transfer, or Waitlist action with a specific reason. Do not edit rows directly unless an approved database recovery requires it.
7. Recheck public availability, member state, and admin counts after the correction.

## Failed email delivery

1. Open the affected Session and review failed-delivery count and failure reason.
2. Confirm MailerSend configuration and provider status without exposing `MAILERSEND_API_KEY` or `CRON_SECRET`.
3. Use **Retry failed notifications** once. It requeues only failed deliveries and records the staff action.
4. Refresh and confirm deliveries move through queued/sending to sent. Do not repeatedly retry while a delivery is already queued or sending.
5. If failures continue, record delivery IDs, notification type, timestamp, and sanitized provider response for engineering follow-up.

## Check-in outage or unavailable device

1. Keep a paper register with Person name and arrival time. Do not collect extra personal data.
2. If admin access still works, use staff check-in. Use **Add walk-in** only for someone without an existing suitable Person/Booking record.
3. If the application is unavailable, do not guess or create duplicate records during the outage. Continue the paper register.
4. After recovery, reconcile each row against the Session roster. Apply attended/no-show corrections with a reason such as `Paper register reconciliation — <date/time>`.
5. Add true walk-ins through the walk-in flow so they are included in recorded walk-in reporting.
6. Finalize attendance only after the paper and digital registers agree.

## Attendance correction after finalization

1. Open the historical Session directly.
2. Choose **Reopen attendance** and enter why the finalized record is changing.
3. Correct the affected Booking statuses, giving a specific reason for every change.
4. Recheck attended and no-show totals, then finalize attendance again.
5. Confirm reopen, corrections, and finalization appear in the audit trail.

## Evidence for escalation

Provide the environment, Session URL/ID, affected operation, Kuala Lumpur timestamp, sanitized error text, Booking or delivery IDs, and reproduction steps. Include screenshots only after removing names, emails, mobile numbers, tokens, and secrets. Never attach database connection strings, environment files, API keys, OTPs, or raw participant exports.
