# Classes page handoff

## Purpose and route

The public Classes page is a dynamic, server-rendered Learning Labs timetable. It uses live database data and supports session-level booking and waitlisting.

- Public route and page: [app/classes/page.tsx](./app/classes/page.tsx)
- Loading state: [app/classes/loading.tsx](./app/classes/loading.tsx)
- Shared page shell: [Navbar](./app/components/Navbar.tsx), [Container](./app/components/Container.tsx), and [Footer](./app/components/Footer.tsx)

## Current page structure

```text
Navbar
└─ Main
   ├─ Hero
   │  ├─ “Learning Labs: Classes”
   │  ├─ Introductory copy
   │  └─ Signed-in account panel (authenticated visitors only)
   ├─ “What we do?”
   │  ├─ Eat Together
   │  └─ Learn Together
   └─ “Join a class”
      ├─ Optional welcome-back email
      ├─ “My Classes” → /dashboard
      └─ Course cards
         └─ Bookable session rows
            ├─ Audience label
            ├─ Session title
            ├─ Date, time, and location
            ├─ Booking/waitlist button
            └─ Remaining-capacity label
Footer
```

The canonical rendered copy and layout are in [app/classes/page.tsx](./app/classes/page.tsx).

## Published copy

### Hero

- **Heading:** `Learning Labs: Classes`
- **Description:** `A few hours where we dive into the deeper questions of God, relationship, and life.`

### What we do?

- **Eat Together:** Members gather around a table to eat and talk. Sometimes some members cook; most often they get food together.
- **Learn Together:** Members practise a way of Jesus, discuss it in small groups after trying it, and sometimes pair with people unlike themselves. Groups stay consistent across the classes.

## Current live timetable

Data checked on **2 September 2026**. The page currently has one public Course:

- **Course:** `Learning Labs: Classes - Knowing God`
- **Course summary:** `A four-part Conversation with God class.`

Every published session is in **Upper Room**, capacity **30**, with **0 confirmed bookings**. Times below are Kuala Lumpur time.

| Session | Audience | Date and time |
| --- | --- | --- |
| Knowing God: Who He is | College/Uni — Sundays | Sun 4 Oct 2026, 1:00–3:00pm |
| Knowing God: Who He is | College/Uni — Fridays | Fri 9 Oct 2026, 8:30–10:30pm |
| Knowing God: Who He is | Teens — Sundays | Sun 11 Oct 2026, 1:30–3:30pm |
| Knowing God: Through Scripture | College/Uni — Sundays | Sun 18 Oct 2026, 1:00–3:00pm |
| Knowing God: Through Scripture | College/Uni — Fridays | Fri 23 Oct 2026, 8:30–10:30pm |
| Knowing God: Through Scripture | Teens — Sundays | Sun 25 Oct 2026, 1:30–3:30pm |
| Knowing God: Through Prayer | College/Uni — Sundays | Sun 1 Nov 2026, 1:00–3:00pm |
| Knowing God: Through Prayer | College/Uni — Fridays | Fri 6 Nov 2026, 8:30–10:30pm |
| Knowing God: Through Prayer | Teens — Sundays | Sun 8 Nov 2026, 1:30–3:30pm |

The [Conversation with God series plan](./.context/plans/add-the-conversation-with-god-class-series.md) calls for a four-part, 12-session series, including sessions on 15, 20, and 22 November. Those final three sessions are not in the current public data.

## Domain model

Canonical terminology: [CONTEXT.md](./CONTEXT.md).

```text
Course
└─ Class (audience-specific offering)
   └─ Session (dated, individually bookable occurrence)
      ├─ Booking
      └─ Waitlist entry
```

- A **Course** is a reusable learning journey.
- A **Class** is an audience-specific offering within a Course.
- A **Session** is a dated, individually bookable meeting of a Class.
- A visitor books a **Session**, never a Course or Class.

The public page renders Course name/description as the outer group, Class audience as the session label, and a Session display name as the title.

Related implementation and plans:

- [Database schema](./lib/db/schema.ts)
- [Public session query and `PublicSession` type](./lib/db/repositories/sessions.ts)
- [Session display-name rules](./lib/db/repositories/session-display-name.ts)
- [Kuala Lumpur timezone helpers](./lib/session-time.ts)
- [Course → Class → Session hierarchy plan](./.context/plans/course-class-session-hierarchy.md)

## What appears publicly

The query in [sessions.ts](./lib/db/repositories/sessions.ts) returns only Sessions that are:

- scheduled;
- in the future;
- attached to a non-archived Class; and
- attached to a non-archived Course.

For each row it returns Course/Class context, audience, location, times, and places left. Availability subtracts confirmed bookings from Session capacity.

Session titles resolve as:

1. `sessions.displayName`, when set;
2. the Class name for a non-recurring Session; or
3. the Class name plus a chronological series number for a recurring Session.

## UI and schedule

The page uses warm off-white surfaces (`#f6f5f0`), charcoal text/controls (`#292823`), white cards, a muted purple interaction accent (`#5c578b`), Archivo Black display type, and Inter body/UI type.

Global type and styling definitions:

- [app/layout.tsx](./app/layout.tsx)
- [app/globals.css](./app/globals.css)

[ScheduleList](./app/classes/ScheduleList.tsx) renders one chronological card per upcoming Session. Cards show date, time, display name, location, audience, low availability, and the booking action. There are currently no timetable filters.

## Authentication and booking

Primary files:

- [BookingControl](./app/classes/BookingControl.tsx)
- [Booking server actions](./lib/bookings/actions.ts)
- [Atomic booking/waitlist commands](./lib/db/repositories/booking-commands.ts)
- [Member booking query](./lib/db/repositories/bookings.ts)
- [Account panel](./app/classes/AccountControl.tsx)
- [Member dashboard](./app/dashboard/page.tsx)

Behaviour:

- Available Session → **Join this class**.
- Full Session → **Join waitlist**.
- Confirmed booking → **You’re In** plus **Cancel booking**.
- No login or no Person profile → redirect to `/dashboard?next=/classes`.
- In-page actions show an inline status message and refresh the route.
- `?booking=confirmed` renders a page-level confirmation banner.
- Cancellation is allowed only for a future confirmed booking and atomically promotes the earliest waitlisted person.

Booking, waitlist, promotion, and cancellation notifications are queued after the database transaction. Setup is documented in [README.md](./README.md).

## Admin content management

Administrators manage Courses and Classes at `/admin/classes`.

- [Admin Courses & Classes page](./app/admin/classes/page.tsx)
- [Course management UI](./app/admin/CoursesPanel.tsx)
- [Class management UI](./app/admin/ClassesPanel.tsx)
- [Admin list queries and types](./lib/db/repositories/admin.ts)
- [Admin server actions](./lib/admin/actions.ts)
- [Admin authorization](./lib/admin/authorization.ts)

Admin capabilities:

- Create, edit, archive, and restore Courses.
- Edit/archive Classes, including name, audience, and description.
- Apply one location to all upcoming scheduled Sessions in a Class.
- Create Sessions, Classes, and Courses through the Sessions workflow.
- Edit a Session’s schedule, capacity, location, display name, status, and check-in window.

Archiving either a Course or a Class hides its future Sessions publicly while retaining records. Admin mutations revalidate `/classes` and `/dashboard`.

## Change checklist

Before making a change, verify:

1. Whether it affects a Course, Class, or Session—the terms are not interchangeable.
2. That booking rules stay Session-scoped.
3. That date parsing/formatting stays in `Asia/Kuala_Lumpur`.
4. That archived Courses/Classes remain hidden publicly.
5. Whether dashboard and admin views also require updates.
6. Whether the three missing planned Conversation with God sessions should be created, or the plan/content should be updated.

## Booking and check-in delivery plan

This is the implementation handoff for taking the existing foundation through a safe participant and staff workflow. Complete and verify each phase before starting the next one.

### Phase 1 — Lifecycle safety

**Status:** implemented locally; migration and deployment remain outstanding.

Delivered:

- Admin Session detail uses a direct ID query, so an ended Session does not disappear when it leaves the upcoming overview.
- Admin rosters and exports include only active `waiting` Waitlist entries.
- Waitlist promotion restores an existing cancelled Booking instead of violating the Person/Session uniqueness constraint.
- Member and staff cancellation use the same atomic cancellation, promotion, audit, and notification path.
- Cancelling a Session changes confirmed Bookings and active Waitlist entries to cancelled, records Booking transitions, and queues emails for everyone affected.
- Confirmed and attended Bookings both consume Session capacity in public, member, and admin counts.
- Attendance can only be finalized after a scheduled Session ends; finalization is durable and idempotent.
- Check-in window constraints require both boundaries or neither boundary.
- Notification idempotency is event-scoped, repeated legitimate booking events are allowed, and stale `sending` deliveries are retried.
- `pnpm test` is the focused regression command.

Deployment requirement:

- Apply [0006_booking_lifecycle_integrity.sql](./drizzle/0006_booking_lifecycle_integrity.sql) with `pnpm db:migrate` in each environment before deploying code that reads the new columns. This is a shared database write and must be explicitly approved and run through the normal deployment process.

Acceptance checks:

1. An ended Session URL still opens for staff.
2. Finalization before the end time is blocked; finalization afterward records who and when.
3. Session cancellation removes confirmed commitments from member dashboards and sends one cancellation event.
4. Cancelling a Booking promotes the earliest active Waitlist entry, including a Person with a previous cancelled Booking.
5. Promoted/cancelled Waitlist history does not appear in the active Waitlist tab or export.
6. A stale email delivery in `sending` is picked up again after ten minutes.

### Phase 2 — Participant booking continuity

**Status:** implemented locally; production deployment remains outstanding.

Delivered:

- The selected Session survives OTP sign-in and first-profile setup, then booking or waitlisting resumes once automatically.
- Every new reservation opens a concise review with the exact date, time, location, audience, and cancellation expectation.
- Confirmed bookings and Waitlist entries receive distinct receipts; receipts cannot be shown for another member's Session by changing the URL.
- Active Waitlists appear on Class cards and in the member dashboard, with a confirmed leave-Waitlist action.
- Booking cancellation now requires confirmation and tells the member that their place may be promoted.
- Class cards include Course, description, audience, location, availability, and a clear distinction between individual Session booking and series participation.
- Confirmed bookings include an iCalendar download from the receipt and member dashboard.
- The upcoming timetable appears before the longer explanation of the Learning Labs format.

Acceptance checks:

1. Starting from any Session, a signed-out or profile-incomplete participant returns to that Session and completes exactly one booking attempt.
2. A full Session creates a visible Waitlist state rather than implying a confirmed place.
3. Leaving a Waitlist verifies Person ownership and only changes an active future entry.
4. Cancellation and Waitlist removal cannot happen from an accidental single click.
5. A confirmation receipt recaps the correct Session and offers a valid calendar file for confirmed bookings.

### Phase 3 — Staff operations

**Status:** implemented locally; migration and production deployment remain outstanding.

Delivered:

- Session Operations separates Upcoming, In progress, Needs finalization, Completed, and Cancelled work instead of hiding ended Sessions.
- Session detail shows location, check-in-window, contact-completeness, Waitlist-pressure, and reminder-delivery readiness alongside the QR check-in link.
- Staff can check in an existing Person or create a minimal new Person as a walk-in outside the participant self-check-in window.
- Active Waitlist entries can be removed or promoted manually. Promotions enforce capacity, restore an earlier cancelled/no-show Booking when necessary, notify the participant, and retain the staff reason.
- A confirmed Booking can be transferred atomically to another future Session in the same Class. The target must have space, and the earliest waiter receives the released source place.
- Every Booking status can be corrected with a required reason. Future cancellations retain fair Waitlist promotion; historical corrections remain possible after attendance is reopened.
- Finalized attendance can be explicitly reopened with a required reason.
- Failed Session notifications and reminder outcomes are visible, and staff can retry failed deliveries.
- Staff operations are recorded in Booking history and the new Session audit-event table. Audit-log reporting remains Phase 4 work.

Deployment requirement:

- Apply [0006_booking_lifecycle_integrity.sql](./drizzle/0006_booking_lifecycle_integrity.sql) first, then [0007_session_operations_audit.sql](./drizzle/0007_session_operations_audit.sql), using `pnpm db:migrate` in each environment before deploying this code. `0007` only adds `collective.session_audit_events`, its two foreign keys, and its Session/date index. Migration execution is a shared database write and is not part of the local implementation.

Acceptance checks:

1. An ended, unfinalized Session appears under Needs finalization and opens from that view.
2. A staff walk-in creates or updates one attended Booking and records the staff member and reason.
3. Manual Waitlist promotion is blocked when full and restores an inactive Booking without creating a duplicate.
4. Transfer is blocked across Classes or into a full/past Session; a successful transfer fills the released place from the earliest waiter.
5. Every correction requires a reason, and finalized attendance must be reopened before roster changes.
6. Failed delivery counts appear on the Session, and retry requeues only failed deliveries.

### Phase 4 — Reporting and operational polish

**Status:** implemented locally; migrations and production deployment remain outstanding.

Delivered:

- `/admin/reports` provides date and Course scope, with Course → Class rollups and Session-level attendance history.
- Attendance/no-show rates use only recorded attendance decisions (`attended` + `no_show`); cancelled and still-confirmed Bookings do not dilute the result.
- Reports show recorded walk-ins, Waitlist conversion, and current unmet demand.
- Staff can export historical programme and roster data for the selected period and Course. The existing per-Session roster export remains available.
- Participant readiness summarizes contact completeness and retained privacy/booking consent for unique People with a Booking or Waitlist record in the period.
- The operational audit trail combines Session audit events with attributed Booking status history. Session edits/cancellation, finalization, reopen, transfer, check-in, walk-in, Waitlist intervention, and failed-notification retries are recorded.
- [BOOKING_OPERATIONS_RUNBOOK.md](./BOOKING_OPERATIONS_RUNBOOK.md) covers verification, migration order, deployment smoke checks, booking/capacity incidents, failed email, check-in fallback, attendance correction, and safe evidence capture.
- Phase 4 requires no additional schema migration beyond Phase 1's `0006` and Phase 3's `0007`.

Known reporting limits:

- “Recorded walk-ins” is inferred from staff walk-in history (`walk_in_check_in` and `staff_walk_in:*`). Walk-ins created before that history existed cannot be reconstructed.
- Waitlist conversion uses retained Waitlist entries. “Still waiting” is current unmet demand, not a historical point-in-time snapshot.
- Attributed Booking history may include participant self-service actions when a user account was recorded; the actor and role are shown rather than silently classifying every event as staff work.

Acceptance checks:

1. A date/Course selection changes Course, Class, and Session results consistently.
2. Attendance rate excludes cancelled and unresolved confirmed Bookings.
3. Programme CSV correctly escapes commas, quotes, and line breaks and opens with UTF-8 names intact.
4. Contact and consent counts include each participating Person once per selected period.
5. Session changes, finalization/reopen, staff interventions, and notification retries appear with actor and reason/detail.
6. The report remains usable on mobile: filters wrap and wide operational tables scroll without clipping the page.
