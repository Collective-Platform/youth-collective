# Admin area handoff

## Purpose and access boundary

The admin area is the staff-only operational workspace for Strictly Students. Its public entry point is `/admin`; from there staff manage Sessions, Class/Course structure, attendance, member records, and roster exports.

Every real admin page is server-rendered with `dynamic = "force-dynamic"` and checks `getCurrentAdminAccess()` before reading protected data. Only signed-in accounts whose `user_accounts.role` is `admin` or `su` may proceed. Unauthorized and signed-out visitors are redirected to `/dashboard`; mutations independently call `requireAdminAccess()` and the export endpoint returns `403`. This defence-in-depth is important: page access alone is not trusted.

Roles currently exposed by the account model are `user`, `admin`, and `su`. There is no separate permission matrix within the admin UI: `admin` and `su` have the same application-level access here.

## Route map and current structure

```text
/admin
├── Sessions overview
│   ├── New Session dialog
│   └── /admin/sessions/[id]
│       ├── Session settings drawer
│       ├── QR check-in link/code
│       ├── CSV export
│       ├── Finalize attendance
│       ├── People joined / Cancelled / No shows tabs
│       └── Add people drawer + manual attendance controls
├── /admin/members
│   └── /admin/members/[id]
│       ├── Personal information tab
│       └── Classes attended tab
└── /admin/classes
    ├── Create Course form
    ├── Course cards: edit/archive/restore
    └── Nested Class cards: edit/location/archive/restore

/admin/export?session={sessionId}
└── authenticated CSV download (bookings + active waitlist)
```

All pages share a responsive shadcn/ui shell: a neutral sidebar becomes a horizontally scrollable top bar below `lg`; the desktop shell is a two-column `15.5rem / content` grid constrained to `max-w-[1600px]`. The admin area uses the project’s shadcn New York primitives and theme tokens rather than bespoke page-level color or control systems.

### Admin visual contract

- **Mode:** Operate. Familiarity, scanability, and consistent controls take priority over visual novelty.
- **Vocabulary:** compose the area from shared shadcn `Button`, `Card`, `Badge`, `Table`, `Dialog`, `Sheet`, `Input`, `Textarea`, `Select`, `Checkbox`, `Alert`, and `Separator` primitives.
- **Styling:** use semantic theme tokens such as `background`, `card`, `muted`, `foreground`, `border`, `destructive`, and `ring`; do not reintroduce admin-specific hex colors or custom control classes.
- **Responsive behavior:** keep the persistent desktop sidebar and horizontally scrollable mobile navigation. Dense tables may scroll horizontally rather than collapsing data into ambiguous cards.
- **Product contract:** preserve the canonical capitalisation of Course, Class, and Session in staff-facing copy, and preserve the existing authorization, preview-mode, route, and server-action boundaries.

## Shared navigation and shell

The sidebar contains:

- **Sessions** → `/admin`
- **People** → `/admin/members`
- **Classes** → `/admin/classes`
- Desktop-only return link to `/classes`
- Desktop-only current staff account indicator and a sign-out control

The sign-out control posts to the shared `/api/auth/logout` route, then replaces the route with `/classes` and refreshes. The sidebar accepts only the three top-level paths as its active state; a Session detail continues to highlight Sessions and a member detail continues to highlight People.

## Development-only preview mode

Each admin page supports `?preview=1` only when `NODE_ENV === "development"`. In this mode it substitutes hard-coded sample access/data and shows a lavender “Local preview” banner. It is intended for UI review without a database or a staff account.

- In production, `preview=1` has no effect; authorization is enforced normally.
- Preview data is local source-code fixture data, not real member records.
- Server actions and `/admin/export` still require a real staff account, so preview mode cannot mutate or export data.
- Session/member detail preview links preserve `preview=1`; the Classes overview does too.

## Sessions overview: `/admin`

The entry page loads `listAdminOverview()` and shows up to 100 Sessions whose `endsAt >= now`, ordered by `startsAt` ascending. It includes scheduled **and cancelled** future/current Sessions. Each session card displays course, session display name, Kuala Lumpur weekday/date/time, optional location, and `confirmedCount / capacity · waitingCount`; it opens `/admin/sessions/{id}`.

An empty state invites staff to create the first Session.

### Create Session dialog

The `New Session` modal lets a staff member:

1. select an existing Class;
2. optionally create a new Class under an existing Course; or
3. optionally create both a new Course and its first Class;
4. pick 1–100 dates from the built-in multi-select calendar;
5. set one start/end time, capacity, location, and optional automatic labels for all selected dates.

Validation enforced server-side:

- Each selected date is a real `YYYY-MM-DD` value.
- Times are `HH:mm`; each end must follow its start.
- Capacity is an integer 1–500.
- Text limits include 120 characters for Course/Class/audience and 2,000 for descriptions.
- New Course/Class selection sentinels are validated separately from UUIDs.

The server transaction creates a shared `recurrenceGroupId` only when auto-label is selected, creates 30-minute-before to 30-minute-after default check-in windows for each occurrence, and either reuses or creates the Course/Class records. New Courses created through this dialog do not explicitly set `publicStatus`, so the schema default (`hidden`) applies.

## Session detail: `/admin/sessions/[id]`

The detail page finds the target Session from the same current/future overview list, fetches its roster and the full member directory in parallel, and returns a 404 if it cannot resolve both the Session and roster. Consequently, a Session that has ended and drops out of the overview is not reachable by this route as currently implemented.

### Header actions

- **Export CSV:** direct download from `/admin/export?session={id}`.
- **Finalize attendance:** changes all still-`confirmed` bookings for this Session to `no_show`, one transaction/audit entry per affected booking. It does not check the session time/status before doing so.
- **Session settings:** opens a right-side drawer for date/times, status, capacity, location, display name, cancellation note, and check-in window.

Session-save validation requires a valid Kuala Lumpur local datetime, an end after start, capacity 1–500, and a check-in close after open. Capacity cannot be reduced below current confirmed-plus-attended bookings. Changing status to `cancelled` saves the given cancellation note or “Cancelled by staff”, creates a durable session-cancellation email delivery for each **confirmed** booking, and dispatches it after commit. Returning a cancelled Session to scheduled clears the stored cancellation reason.

The drawer also generates a QR PNG in-process using the check-in URL `/check-in/{checkInToken}`. The absolute URL uses `SITE_URL` if configured, else forwarded protocol/host headers. The QR is rendered unoptimized by `next/image`; the raw URL is also shown. `checkInToken` is a per-session UUID set by the schema.

### Roster tabs and attendance

The roster has query-string tabs:

| Tab | Query | Shows | Available actions |
| --- | --- | --- | --- |
| People joined | default / `tab=joined` | `confirmed` and `attended` bookings | Add people; Check in confirmed booking; mark an attended booking no-show |
| Cancelled | `tab=cancelled` | `cancelled` bookings | View person/contact only |
| No shows | `tab=no-show` | `no_show` bookings | View person/contact only |

Roster rows link to the person record and display name plus mobile. Although the repository also reads email, the session roster table itself currently shows only mobile contact. There is no waitlist tab; the overview shows its count and CSV includes its active entries.

**Add people** opens a searchable drawer over all People (name/email/mobile, limited client-side to 12 matches). It submits an existing person ID through the same atomic capacity command as member self-booking: the person either receives a confirmed booking or a fair waitlist entry, gets a notification after commit, and cannot duplicate a booking/waitlist entry.

**Manual attendance** behaves as follows:

- A confirmed booking gets a `Check in` button, setting it to `attended`.
- An attended booking displays `Checked in` and an overflow option to set it to `no_show`.
- Staff can additionally send `cancelled`, `attended`, or `no_show` status via the server action, but the current UI exposes only the two flows above.
- Every actual staff adjustment writes `booking_status_history` with reason `staff_adjustment`.

## Member directory: `/admin/members`

The People page is a staff-only, database-backed directory. Its GET search form takes `q`; the repository trims it, escapes SQL wildcard characters, and performs case-insensitive matching across person name, login email, and mobile. It returns all matching People ordered by name then ID; there is no pagination or explicit result limit.

The directory table exposes:

- Name (link to member detail)
- Login email, if any, and mobile
- Birthday, if provided
- Count of all bookings (not only attended)
- Person record creation date as “Joined”

The empty state is a search-specific “No members found” message. The table can include People with no login, no name, no mobile, or no birthday; placeholders make those gaps explicit.

### Member detail: `/admin/members/[id]`

The detail page defaults to `tab=personal`; `tab=classes` opens the history view.

- **Personal information:** email (mailto link), mobile (tel link), birthday, and person-record creation date.
- **Classes attended:** only history entries whose booking status is `attended`, newest first; each has the session display name and Kuala Lumpur date. Confirmed, cancelled, and no-show history is intentionally excluded from this tab even though the underlying history query reads all of them.

It is read-only: no profile edits or attendance changes are offered from a member record. A missing person ID returns a 404.

## Courses & Classes: `/admin/classes`

The Classes navigation item is structurally Course-first. `listAdminCourses()` returns all Courses, including archived ones, ordered with non-archived records first, and nests each Course’s Classes.

### Course controls

- Top create form: required name and short summary, plus visibility defaulting to `hidden`.
- Course card: title, description, status badge, archive/restore button.
- Expandable Edit Course form: name, summary, visibility.

Visibility values and their member meaning:

| Value | UI label | Public effect |
| --- | --- | --- |
| `active` | Now running | Upcoming scheduled, non-archived sessions may be returned by the Classes page and booked |
| `coming_next` | Coming next | Informational only; not included in public bookable sessions |
| `hidden` | Hidden from members | Not included in public bookable sessions |

Archiving a Course simply sets `courses.isArchived`; no records are deleted. The public sessions query excludes archived Courses and Classes, so future Sessions disappear from the member Classes page while historic data remains.

### Class controls

Each nested Class shows name, audience/description summary, active/archive badge, and an Edit drawer:

- Update name, audience, and description.
- Apply one location to every **upcoming, scheduled** Session in that Class; individual session edits can override it later.
- Archive/restore the Class. Archiving hides its future Sessions from the public Classes listing without deleting records.

Classes cannot be created directly from this screen. The instruction and empty state point staff to the Sessions overview’s New Session dialog, which is the only current class-creation UI.

## Data model and server flow

```text
valid session cookie
       │
       ▼
getCurrentAdminAccess / requireAdminAccess
       │ role = admin or su
       ▼
Admin page / server action / export
       │
       ├── admin repository reads
       │   ├── courses → classes → sessions
       │   ├── bookings + waitlist_entries → rosters/counts
       │   └── people + user_accounts → directory/contact data
       │
       └── admin commands
           ├── create/update/archive Course/Class/Session
           ├── reserveSession for staff-added People
           ├── staff attendance adjustment/finalisation
           └── notification delivery creation + post-commit dispatch
```

Key model relationships:

- A Course groups Classes; a Class groups dated Sessions.
- A Person is the church/member record; a user account is optional login data linked one-to-one to it.
- A Booking is a Person’s statusful reservation for a Session; status history is immutable.
- Waitlist entries are ordered by `createdAt` and promote through the same booking transaction on member cancellation.
- Notification deliveries are durable/idempotent work records, not a direct email send inside the write transaction.

All staff datetime values are parsed/formatted in `Asia/Kuala_Lumpur` (`+08:00`) and use `en-GB` presentation formatting.

## CSV export: `/admin/export?session={id}`

The GET route rechecks staff authorization and requires a `session` query parameter. It creates an RFC-style quoted CSV response (quotes escaped as doubled quotes), `text/csv; charset=utf-8`, `nosniff`, and a `session-{id}-roster.csv` download name.

Columns are `list`, `name`, `email`, `mobile`, `status`, `waitlist_joined`:

- One row per booking, with its stored booking status.
- One row per active waitlist entry, status `waiting`, and ISO creation time in `waitlist_joined`.

Unlike the detail page, the route does not validate that `session` is a UUID or that the session exists before querying. An invalid/nonexistent ID yields a successful CSV header with no rows rather than a 404.

## Connected member self-check-in flow

Session administration configures the member-facing QR/check-in system; it does not itself check a member in through the QR path.

1. Staff configure a session’s check-in window and show its generated QR code.
2. The member scans `/check-in/{token}` and sees session date/time/location plus sign-in/profile completion UI if needed.
3. `selfCheckInAction` verifies the caller’s identity/profile.
4. `selfCheckIn` locks the Session and caller’s booking, requires a scheduled Session and current time within the configured window, and changes only that caller’s confirmed Booking to `attended`, with `self_check_in` audit reason.
5. The admin’s People joined tab can then display “Checked in.”

The production Vercel cron runs hourly, creating 24-hour session-reminder notifications and draining queued/retryable delivery work. It is separate from the admin UI but explains the notification infrastructure that staff writes use.

## Relevant file map

### Admin routes and UI

- [app/admin/layout.tsx](app/admin/layout.tsx) — admin route metadata/layout boundary.
- [app/admin/page.tsx](app/admin/page.tsx) — Sessions overview, development fixtures, and Session links.
- [app/admin/AdminSidebar.tsx](app/admin/AdminSidebar.tsx) — responsive staff navigation shell.
- [app/admin/AdminAccountControl.tsx](app/admin/AdminAccountControl.tsx) — admin sign-out and account indicator.
- [app/admin/AdminCreateControls.tsx](app/admin/AdminCreateControls.tsx) — New Session dialog, multi-date calendar, and Course/Class creation choices.
- [app/admin/classes/page.tsx](app/admin/classes/page.tsx) — Course/Class management route and preview fixture.
- [app/admin/CoursesPanel.tsx](app/admin/CoursesPanel.tsx) — Course create/edit/archive UI and nested Classes.
- [app/admin/ClassesPanel.tsx](app/admin/ClassesPanel.tsx) — Class edit/location/archive drawer UI.
- [app/admin/members/page.tsx](app/admin/members/page.tsx) — People directory, query search, and preview fixture.
- [app/admin/members/[id]/page.tsx](<app/admin/members/[id]/page.tsx>) — member detail tabs and preview fixture.
- [app/admin/sessions/[id]/page.tsx](<app/admin/sessions/[id]/page.tsx>) — Session detail, QR generation, roster tabs, and header actions.
- [app/admin/sessions/[id]/AddPersonDrawer.tsx](<app/admin/sessions/[id]/AddPersonDrawer.tsx>) — searchable existing-Person add-to-session UI.
- [app/admin/sessions/[id]/ManualCheckInButton.tsx](<app/admin/sessions/[id]/ManualCheckInButton.tsx>) — manual attendance control.
- [app/admin/sessions/[id]/SessionSettingsDrawer.tsx](<app/admin/sessions/[id]/SessionSettingsDrawer.tsx>) — Session settings drawer shell.
- [app/admin/export/route.ts](app/admin/export/route.ts) — protected roster CSV response.

### Authorization, reads, and writes

- [lib/admin/authorization.ts](lib/admin/authorization.ts) — page/action/export staff authorization boundary.
- [lib/admin/actions.ts](lib/admin/actions.ts) — all admin server actions, input validation, notification dispatch, and revalidation.
- [lib/db/repositories/admin.ts](lib/db/repositories/admin.ts) — admin overview, roster, directory, detail, and history read models.
- [lib/db/repositories/admin-commands.ts](lib/db/repositories/admin-commands.ts) — Course/Class/Session mutation and staff attendance persistence.
- [lib/db/repositories/booking-commands.ts](lib/db/repositories/booking-commands.ts) — atomic shared booking/waitlist command used when staff add a person.
- [lib/db/repositories/bookings.ts](lib/db/repositories/bookings.ts) — member booking read model affected by admin changes.
- [lib/db/repositories/sessions.ts](lib/db/repositories/sessions.ts) — public upcoming sessions excluded by archive/visibility status.
- [lib/db/repositories/session-display-name.ts](lib/db/repositories/session-display-name.ts) — session naming seam.
- [lib/db/schema.ts](lib/db/schema.ts) — Drizzle table/enums and constraints.
- [lib/db/client.ts](lib/db/client.ts) — lazy server-only Postgres/Drizzle client.
- [lib/db/repository.ts](lib/db/repository.ts) — transaction helper used by booking/check-in flows.
- [lib/session-time.ts](lib/session-time.ts) — Kuala Lumpur date input/output contract.
- [lib/notifications/email.ts](lib/notifications/email.ts) — durable notification queueing/delivery used by session/admin writes.

### Authentication, member experience, and jobs

- [lib/auth/user.ts](lib/auth/user.ts) — current user and authentication guard used by admin authorization.
- [lib/auth/session.ts](lib/auth/session.ts) — session-cookie validation and lifecycle.
- [app/api/auth/logout/route.ts](app/api/auth/logout/route.ts) — shared logout endpoint.
- [app/check-in/[token]/page.tsx](<app/check-in/[token]/page.tsx>) — member QR check-in page generated from Session settings.
- [app/check-in/[token]/CheckInControl.tsx](<app/check-in/[token]/CheckInControl.tsx>) — member check-in client control.
- [lib/check-in/actions.ts](lib/check-in/actions.ts) — authenticated self-check-in server action.
- [lib/db/repositories/check-in.ts](lib/db/repositories/check-in.ts) — locked/check-in-window-safe booking update.
- [app/api/cron/session-reminders/route.ts](app/api/cron/session-reminders/route.ts) — protected hourly reminder/delivery runner.
- [vercel.json](vercel.json) — hourly cron schedule.
- [.env.example](.env.example) — database, session secret, MailerSend, site URL, and cron secret configuration.

### Product and database history

- [PRODUCT.md](PRODUCT.md) — product terminology and intent.
- [CONTEXT.md](CONTEXT.md) — workspace context notes.
- [CLASSES_PAGE_HANDOFF.md](CLASSES_PAGE_HANDOFF.md) — companion handoff for the public booking surface the admin controls.
- [DASHBOARD_PAGE_HANDOFF.md](DASHBOARD_PAGE_HANDOFF.md) — companion handoff for the member view of bookings/attendance.
- [drizzle/0000_initial_collective_schema.sql](drizzle/0000_initial_collective_schema.sql) — initial Collective schema.
- [drizzle/0001_wild_polaris.sql](drizzle/0001_wild_polaris.sql), [drizzle/0002_green_sentinels.sql](drizzle/0002_green_sentinels.sql), [drizzle/0003_session-display-name.sql](drizzle/0003_session-display-name.sql), [drizzle/0004_courses.sql](drizzle/0004_courses.sql), [drizzle/0005_course_public_status.sql](drizzle/0005_course_public_status.sql) — subsequent schema evolution.

## Change guide for a future AI

- Keep authorization at **both** the route/read boundary and every mutation/export boundary. Repository functions document that the caller owns authorization; do not expose them directly to untrusted clients.
- Preserve preview mode’s `NODE_ENV === "development"` gate and keep every write/export protected. Do not turn sample fixtures into a production bypass.
- Treat Course `publicStatus`, Course archive, Class archive, Session status, and booking status as separate concepts. Changing one does not automatically alter the others.
- Use the existing server actions/repositories instead of writing direct database mutations in client components. They centralize validation, auditing, revalidation, and notification work.
- Check downstream surfaces when modifying Sessions: `/classes`, `/dashboard`, and `/check-in/[token]` consume their availability, status, time, display name, location, and check-in configuration.
- If adding pagination/search to the member directory or session history, make it server-side; the current full directory fetch is also used by the Add people drawer.
- If exposing waitlist management in the UI, retain the fair ordering/capacity logic in `booking-commands.ts` rather than manually creating bookings.

## Operational dependencies and verification status

| Dependency | Admin use | Failure/absence |
| --- | --- | --- |
| `DATABASE_URL` | all real records, roles, rosters, writes | real admin pages/actions cannot obtain data or make changes |
| `SESSION_SECRET` | valid signed-in identity | admin authorization cannot be established safely |
| `SITE_URL` | canonical QR check-in link | page falls back to request forwarded host/protocol |
| MailerSend variables | OTPs, cancellation/booking/waitlist/reminder email | relevant notification dispatches fail/retry; database mutations still create durable work |
| `CRON_SECRET` + Vercel cron | hourly reminders/retry deliveries | cron returns configuration/authorization errors rather than operating |

No test is dedicated to `app/admin` at this handoff point. Existing focused tests that cover closely coupled behavior are [lib/db/repositories/booking-commands.test.mts](lib/db/repositories/booking-commands.test.mts) and [lib/session-time.test.mts](lib/session-time.test.mts).
