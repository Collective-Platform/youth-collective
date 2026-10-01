# Dashboard page handoff

## Purpose and route

The member dashboard is the authenticated home at `/dashboard`. It is a server-rendered Next.js App Router page (`dynamic = "force-dynamic"`) that brings a member's Learning Labs commitments together in one place:

- Class bookings from the Postgres/Drizzle booking system.
- Learning Labs: Experience registration and payment state from the Google Sheet integration.
- The signed-in member's booking profile and consent record.
- A compact participation timeline made from the two sources above.

The page is deliberately an account-safe read model. It displays only the signed-in account's booking data and a deliberately narrow registration summary; the full Experience registration (including sensitive form answers/contact information) never leaves the Google Sheets repository module.

## Current information architecture

```text
/dashboard
├── Signed out
│   ├── Page heading: “Your dashboard, in one place.”
│   └── Email OTP sign-in/sign-up panel
├── Signed in, no complete person profile
│   ├── Page heading: “Start your dashboard.”
│   └── Required profile + two consent checkboxes
└── Signed in, complete profile
    ├── Welcome header and Class CTA
    ├── In-page anchor navigation
    │   ├── Next up
    │   ├── Right now
    │   ├── Your story
    │   └── Your details
    ├── Next up — one payment action, next confirmed future booking, or empty CTA
    ├── Right now
    │   ├── Classes — every confirmed future booking
    │   └── Experience — every matched Experience registration
    ├── Your story — past/non-confirmed bookings + registrations, newest first
    └── Your details — editable member profile
```

The visual language is monochrome and neutral: `bg-neutral-100` canvas, white bordered cards, black primary actions, rounded-xl cards/pills, and large `font-heading` (Archivo Black) headings. The main content is centered at `max-w-5xl`; its shared outer container is `max-w-7xl`.

## Render states and exact behaviour

| State | Condition | What the member sees | Primary action |
| --- | --- | --- | --- |
| Signed out | No valid `__session` cookie/account | Navbar in Login mode, introductory heading, `EmailOtpForm` | Request and verify email OTP |
| Profile required | Signed-in account has no person with both `name` and `mobile` | Navbar with user email, onboarding heading, profile form with mandatory privacy and booking consents | Save profile, then redirect to safe `next` or `/dashboard` |
| Dashboard | Signed-in account has a complete profile | Welcome header, four anchored sections, logout-capable navbar | Book/edit/cancel through linked UI/actions |
| Cancellation feedback | `?cancelled=1` | Status banner: “Your Class booking has been cancelled.” | None; state is already persisted |

`next` is accepted only when it starts with one slash but not `//`; otherwise it falls back to `/dashboard`, preventing open redirects.

## Full dashboard structure

### Header

- Circular monogram is the capitalized first letter of the first whitespace-delimited name token.
- Greeting is `Welcome back, {firstName}.`
- The sole header CTA goes to `/classes` (`Explore Classes`).
- The section nav uses direct anchors: `#next-up`, `#right-now`, `#your-story`, and `#your-details`.

### Next up

Selection order matters:

1. The **first registration needing attention or still pending**, in the order returned by Google Sheets, wins.
2. Otherwise the earliest **confirmed booking whose `startsAt >= now`** wins.
3. Otherwise show the no-commitments empty state and an `/classes` CTA.

For a selected booking, the card includes month/day, course name, class/session display name, weekday/date, Kuala Lumpur start/end time, optional location, Booking status pill, and a Cancel Booking control. For a selected registration it includes title, fixed date label, payment status, optional payment detail, and `/learninglabs` link.

### Right now

This is a two-column grid on large screens:

- **Classes:** only confirmed future bookings, ascending by start time. Each row shows date tile, course, class/session, status, date/time, location, and cancellation control.
- **Experience:** every email-matched Experience registration. Each card shows the fixed “Learning Labs: Experience” title, fixed `6–12 December 2026` dates, payment label/detail, and `/learninglabs` link. Empty state links to `/learninglabs`.

`Right now` intentionally excludes cancelled, attended, no-show, and past bookings from its Class list.

### Your story

The timeline combines:

- every booking that is either in the past **or not currently confirmed**; and
- every mapped Experience registration.

It sorts these mixed entries newest-first by their `Date` value. Bookings retain their status (`Booked`, `Cancelled`, `Attended`, `No show`); registrations use their payment label. The empty state explains that Classes attended and programme registrations will appear here. The copy says future church milestones may use this same timeline, but no such data source is implemented yet.

### Your details

The same client `ProfileForm` used during onboarding appears again in edit mode. It exposes:

- Required: full name, mobile number.
- Optional: birth date or age band (the UI permits both, though its label implies an alternative).
- Age bands: `11–12`, `13–15`, `16–18`, `19+`.

In edit mode the two consents are not shown or changed. A successful edit retains the user on the page, announces “Your details have been saved,” and refreshes server data.

## Data flow

```text
Browser request /dashboard
          │
          ▼
getCurrentUser() ──► __session cookie ──► auth_sessions + user_accounts
          │
          ├── no user ──► Email OTP UI
          │
          ▼
findPersonProfileForUserAccount(user.id) ──► people + user_accounts
          │
          ├── incomplete/no profile ──► Profile UI
          │
          ▼
Promise.all
├── listBookingsForAuthSubject(user.id)
│   └── bookings → people → user_accounts → sessions → classes → courses
└── listMemberRegistrationsForEmail(user.email)
    └── Google Sheet “Registrations” (only account-safe columns)
          │
          ▼
Dashboard-specific selection, grouping, formatting, and rendering
```

No profile, booking, or registration data is fetched from the browser. The page and repositories run server-side; the three client components only initiate constrained mutations/auth requests.

### Booking data contract

`listBookingsForAuthSubject` returns `MemberBooking` records with `id`, session/class/course IDs, course name, booking status, display name, optional location, and start/end `Date`s. It returns an empty list if `DATABASE_URL` is absent, which lets a fresh checkout render without a database but produces an empty dashboard once an otherwise valid profile exists.

The dashboard supports four booking statuses:

| Stored status | Display label | Dashboard placement |
| --- | --- | --- |
| `confirmed` | Booked | Next up / Right now while future; Story after its start time |
| `cancelled` | Cancelled | Story |
| `attended` | Attended | Story |
| `no_show` | No show | Story |

The visible Class name comes from `sessionDisplayName` (a session-level display-name seam), not necessarily the Class record's raw `name`.

### Experience registration contract

`listMemberRegistrationsForEmail` calls `listExperienceRegistrationsForEmail(email)` and maps each result to a `MemberRegistration`. The current presentation is intentionally hard-coded to the 2026 Experience:

| Field | Current value/source |
| --- | --- |
| `title` | `Learning Labs: Experience` (fixed) |
| `dates` | `6–12 December 2026` (fixed) |
| `startsAt` | `2026-12-06T00:00:00+08:00` (fixed) |
| `href` | `/learninglabs` (fixed) |
| `id` | Sheet `Registration ID` |
| payment data | Sheet columns: payment plan, status, installments paid, last payment failure |

Payment mapping:

| Sheet condition | Dashboard label | Detail |
| --- | --- | --- |
| `Paid` or `Paid in full` | Payment confirmed | none |
| `Subscription active` or starts with `Installment ` | Payment plan active | `{installmentsPaid} instalments paid`, if present |
| `Payment failed` or non-empty last-payment-failure | Payment needs attention | “Please check your payment email or contact the team.” |
| Anything else | Payment pending | Payment-plan-specific pending message, if a plan exists |

Matching normalizes member and sheet emails with `trim().toLowerCase()`. Google Sheets misconfiguration and read failures are deliberately swallowed into `[]`, so registrations never take down the dashboard.

## Authentication, profile, and mutations

### Email OTP

The signed-out form starts in login mode and lets the member switch to sign-up. It POSTs JSON to the request endpoint, then POSTs the email, six-digit code, and mode to verify. It automatically submits when the sixth numeric digit is typed and blocks duplicate client verification calls.

- Codes expire after 10 minutes and only their HMAC hashes are stored.
- Request rate limit: 5 per email / 15 minutes.
- Verification rate limit: 10 per email / 5 minutes.
- Successful verification creates a 30-day server-side session and an HTTP-only, `SameSite=Lax` `__session` cookie (`Secure` in production).
- Sign-up transaction creates a blank `people` row and linked `user_accounts` row; the dashboard then requires profile completion.

### Profile save

`saveMyProfileAction` requires authentication and validates name (2–120 chars), mobile (7–30 chars), ISO date shape if supplied, and a 40-character age-band maximum. First-time profile completion additionally requires privacy and booking consents; that action records both consent timestamps. The repository updates through the account-to-person relationship, so callers never submit a person ID.

### Booking cancellation

The Cancel Booking UI calls `cancelBookingAction(bookingId)`. The action validates a UUID, resolves the signed-in account's person, and only cancels that person's future confirmed booking for a scheduled session. The transaction creates audit history and notification work, and promotes the earliest waitlisted person when applicable. Both `/classes` and `/dashboard` are revalidated. The UI redirects successful cancellation to `/dashboard?cancelled=1`; unavailable bookings show “This Booking can no longer be cancelled.”

## Time, metadata, and responsiveness

- All dashboard date/time formatters use `Asia/Kuala_Lumpur`; session input parsing also anchors local values at UTC+08:00.
- Locale is `en-GB`: weekday and full/short day-month labels, with `HH:mm`-style time output.
- Route metadata: `Dashboard | Strictly Students`; description: “See what is next, your Learning Labs commitments, and your participation record.”
- This route does **not** render `Footer`, unlike the Classes page.
- The global root layout supplies Inter (`font-sans`), Archivo Black (`font-heading`), global CSS, and Vercel Analytics.
- Primary dashboard layout is a single column, changing the Right now cards to two columns at `lg`; booking rows become three columns at `sm`.

## Relevant file map

### Dashboard implementation

- [app/dashboard/page.tsx](app/dashboard/page.tsx) — server page, all render-state branching, formatting helpers, and section components.
- [app/dashboard/EmailOtpForm.tsx](app/dashboard/EmailOtpForm.tsx) — client email-code login/sign-up flow.
- [app/dashboard/ProfileForm.tsx](app/dashboard/ProfileForm.tsx) — client onboarding/edit profile form.
- [app/dashboard/CancelBookingButton.tsx](app/dashboard/CancelBookingButton.tsx) — client cancellation control.

### Auth and profile path

- [lib/auth/user.ts](lib/auth/user.ts) — current-user and authentication guard boundary.
- [lib/auth/session.ts](lib/auth/session.ts) — server session validation, renewal, cookie creation, and destruction.
- [lib/auth/crypto.ts](lib/auth/crypto.ts) — OTP/session token generation and hashing.
- [lib/auth/rate-limit.ts](lib/auth/rate-limit.ts) — persistent OTP rate limiting.
- [lib/auth/email.ts](lib/auth/email.ts) — delivery of the sign-in code.
- [app/api/auth/otp/request/route.ts](app/api/auth/otp/request/route.ts) — validates and issues OTPs.
- [app/api/auth/otp/verify/route.ts](app/api/auth/otp/verify/route.ts) — consumes OTPs, creates accounts/sessions.
- [app/api/auth/logout/route.ts](app/api/auth/logout/route.ts) — ends the current session.
- [lib/profile/actions.ts](lib/profile/actions.ts) — authenticated profile server action and validation.
- [lib/db/repositories/people.ts](lib/db/repositories/people.ts) — account-to-person profile read/write boundary.

### Classes and bookings path

- [lib/db/repositories/bookings.ts](lib/db/repositories/bookings.ts) — member booking read model used by dashboard and Classes.
- [lib/bookings/actions.ts](lib/bookings/actions.ts) — authenticated booking/cancellation server actions and revalidation.
- [lib/db/repositories/booking-commands.ts](lib/db/repositories/booking-commands.ts) — atomic capacity, cancellation, waitlist-promotion, audit, and notification commands.
- [lib/db/repositories/sessions.ts](lib/db/repositories/sessions.ts) — public upcoming-session read model for the linked Classes page.
- [lib/db/repositories/session-display-name.ts](lib/db/repositories/session-display-name.ts) — class/session naming used in dashboard booking rows.
- [lib/db/schema.ts](lib/db/schema.ts) — Drizzle schema for account, person, course, class, session, booking, waitlist, audit, and notification tables.
- [lib/db/client.ts](lib/db/client.ts) — lazy server-only Postgres/Drizzle client.
- [lib/db/repository.ts](lib/db/repository.ts) — transaction helper used by booking commands.
- [lib/notifications/email.ts](lib/notifications/email.ts) — post-commit notification delivery invoked by booking actions.
- [app/classes/page.tsx](app/classes/page.tsx) — linked discovery/booking page and return destination for dashboard CTAs.
- [app/classes/BookingControl.tsx](app/classes/BookingControl.tsx) — member booking UI from the Classes page.
- [app/classes/ScheduleList.tsx](app/classes/ScheduleList.tsx) — public schedule presentation and booking entry points.
- [app/classes/AccountControl.tsx](app/classes/AccountControl.tsx) — Classes-page account affordance.

### Experience registration path

- [lib/member-registrations.ts](lib/member-registrations.ts) — dashboard-safe registration adapter and payment-label mapping.
- [lib/google-sheets.ts](lib/google-sheets.ts) — Google Sheets client and narrow email-based registration query.
- [lib/program-registration.ts](lib/program-registration.ts) — registration sheet contract, validated form model, and payment columns.
- [app/(site)/learninglabs/page.tsx](<app/(site)/learninglabs/page.tsx>) — Experience landing page; prefills its registration form from the current member profile.
- [app/(site)/learninglabs/LearningLabsExperience.tsx](<app/(site)/learninglabs/LearningLabsExperience.tsx>) — Experience page composition and registration UI.
- [app/api/program-registration/route.ts](app/api/program-registration/route.ts) — programme registration endpoint.
- [app/api/stripe/webhook/route.ts](app/api/stripe/webhook/route.ts) — payment updates that feed the registration status shown here.
- [lib/stripe.ts](lib/stripe.ts) — Stripe integration.

### Shared shell, configuration, and background context

- [app/components/Navbar.tsx](app/components/Navbar.tsx) — dashboard/Login navigation state and sign-out control.
- [app/components/Container.tsx](app/components/Container.tsx) — shared width/gutter wrapper.
- [app/layout.tsx](app/layout.tsx) — fonts, global styles, and analytics.
- [app/globals.css](app/globals.css) — global visual tokens/base styles.
- [lib/session-time.ts](lib/session-time.ts) — Kuala Lumpur session time-zone contract.
- [.env.example](.env.example) — required database, auth secret, mail, and cron environment variables; Google Sheets variables are read in code but are not currently documented here.
- [package.json](package.json) — Next 16/React 19 stack and database scripts.
- [drizzle/0000_initial_collective_schema.sql](drizzle/0000_initial_collective_schema.sql) — initial database migration.
- [drizzle/0001_wild_polaris.sql](drizzle/0001_wild_polaris.sql), [drizzle/0002_green_sentinels.sql](drizzle/0002_green_sentinels.sql), [drizzle/0003_session-display-name.sql](drizzle/0003_session-display-name.sql), [drizzle/0004_courses.sql](drizzle/0004_courses.sql), [drizzle/0005_course_public_status.sql](drizzle/0005_course_public_status.sql) — subsequent schema evolution.
- [PRODUCT.md](PRODUCT.md) — product-level intent and terminology.
- [CONTEXT.md](CONTEXT.md) — project/context notes currently present in the workspace.
- [CLASSES_PAGE_HANDOFF.md](CLASSES_PAGE_HANDOFF.md) — companion handoff for the upstream Classes booking page.

## Change guide for a future AI

- Change **dashboard presentation or selection rules** in `app/dashboard/page.tsx` first; keep the repository contracts narrow rather than importing database tables into the page.
- Add a new member-visible programme source by extending `lib/member-registrations.ts` with another safe adapter. Do not expand the Google Sheets query with sensitive form columns merely for display.
- Update the hard-coded Experience title/date/link in `lib/member-registrations.ts` when the programme changes. This is the single current mapping point.
- If adding a new booking status, update the Drizzle enum/migration, `MemberBooking` status union, both dashboard status maps, booking command logic, and all relevant UI states together.
- Preserve the client/server boundary: server page/repositories fetch data; `EmailOtpForm`, `ProfileForm`, and `CancelBookingButton` own user interaction only.
- Keep `force-dynamic`: user-specific sessions and up-to-date booking/payment data make static output inappropriate.
- The dashboard currently uses only email matching for Experience registrations. If account identity must become more durable, add an explicit account/registration identity bridge at the adapter/data layer rather than changing the UI alone.

## Operational dependencies and graceful degradation

| Dependency | Used for | Missing/failing behaviour |
| --- | --- | --- |
| `DATABASE_URL` | authentication, profile, bookings | booking repositories return empty lists; session/profile functionality cannot establish a usable dashboard |
| `SESSION_SECRET` | hashed OTP/session credentials | required by auth crypto path |
| MailerSend variables | sending OTPs and booking notifications | login/sign-up request reports a send failure |
| `GOOGLE_SHEET_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | Experience registration summary | Experience list is empty; dashboard still works for Classes |
| Stripe webhook/configuration | payment state written to the registration source | labels can become stale/pending, depending on sheet data |

No tests are dedicated to `app/dashboard/page.tsx` at the time of this handoff. Existing focused tests cover session time and booking-command behaviour: [lib/session-time.test.mts](lib/session-time.test.mts) and [lib/db/repositories/booking-commands.test.mts](lib/db/repositories/booking-commands.test.mts).
