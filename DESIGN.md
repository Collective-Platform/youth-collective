---
name: Strictly Students — Member Dashboard
description: A calm editorial operations dashboard for a member's Class commitments.
colors:
  ink: "#000000"
  paper: "#f7f6f1"
  white: "#ffffff"
  charcoal: "#2e302e"
  charcoal-hover: "#414441"
  botanical-green: "#dce8c6"
  botanical-green-deep: "#cadab0"
  botanical-ink: "#273022"
  ink-violet: "#625e85"
  muted-record: "#efedf2"
  record-ink: "#29263a"
  record-muted: "#4f4a75"
  attended-lilac: "#efedf6"
  no-show-pink: "#f8e8ed"
  no-show-ink: "#9e4059"
  notice-green: "#e4eddc"
  notice-ink: "#334230"
typography:
  display:
    fontFamily: "Archivo Black, sans-serif"
    fontSize: "3rem"
    fontWeight: 400
    lineHeight: 0.92
    letterSpacing: "-0.04em"
  public-heading:
    fontFamily: "Archivo Black, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 400
    lineHeight: 0.94
    letterSpacing: "-0.035em"
  sign-in-headline:
    fontFamily: "Archivo Black, sans-serif"
    fontSize: "clamp(3rem, 4vw, 4rem)"
    fontWeight: 400
    lineHeight: 0.98
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Archivo Black, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 400
    lineHeight: 0.95
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
    lineHeight: 1.5
  micro:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.65rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.13em"
rounded:
  card: "0.75rem"
  date-block: "0.75rem"
  pill: "9999px"
spacing:
  page: "1.5rem"
  section: "3rem"
  card: "1.5rem"
components:
  botanical-action-pill:
    backgroundColor: "{colors.botanical-green}"
    textColor: "{colors.botanical-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 1.25rem"
    height: "2.75rem"
  charcoal-action-pill:
    backgroundColor: "{colors.charcoal}"
    textColor: "{colors.white}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 1.25rem"
    height: "3rem"
  booking-record:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.card}"
    padding: "0.25rem 1.5rem"
  booking-status-attended:
    backgroundColor: "{colors.attended-lilac}"
    textColor: "{colors.record-muted}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 0.75rem"
    height: "1.75rem"
  calendar-block:
    backgroundColor: "{colors.botanical-green}"
    textColor: "{colors.botanical-ink}"
    rounded: "{rounded.date-block}"
    size: "5.75rem"
  record-panel:
    backgroundColor: "{colors.muted-record}"
    textColor: "{colors.record-ink}"
    rounded: "{rounded.card}"
    padding: "1.5rem"
---

# Design System: Strictly Students — Member Dashboard

## Overview

**Creative North Star: "The Quiet Class Desk"**

This signed-in dashboard treats a member's Classes as a current, personal record rather than a profile form with a list attached. A softened botanical green signals the immediate path, ink-violet supplies restrained record and focus punctuation, and charcoal gives the next commitment and account rail enough weight without resorting to pure black feature fields. The result is calm, friendly, and operational: members can orient themselves, find their place, and act without visual noise.

The composition remains deliberately chronological. The next Class leads; the remaining schedule follows; history and the attendance record sit after it; editable details come last. The surface relies on real Booking data and purposeful empty states—never sample sessions, fabricated totals, or decorative charts.

**Key Characteristics:**

- A quiet command-centre hierarchy with one immediately legible next commitment.
- Editorial typography and flat bordered records, kept practical by clear rows and labels.
- Botanical green and ink-violet used as measured accents against paper, white, and charcoal.

## Colors

The palette uses warm paper and clean white records as the working field; botanical green and ink-violet are sparse operational accents, while charcoal holds the highest-emphasis surfaces.

### Primary

- **Botanical Green:** marks the current destination, primary calendar block, and direct discovery actions.
- **Charcoal:** anchors the next-Class card, the desktop rail header, and dark actions; use it instead of a pure-black feature field.
- **Ink:** retains the strongest headings and body text on light surfaces.

### Secondary

- **Ink-Violet:** denotes focus, attended-record punctuation, and supporting emphasis; it is not a second action colour.
- **Muted Record:** forms the quiet attendance-summary panel with record ink and muted violet labels.

### Tertiary

- **Attended Lilac:** marks an attended Booking alongside its check and text label.
- **No-show Pink:** marks a no-show Booking with the accompanying no-show ink.
- **Notice Green:** carries low-urgency confirmation and account-completion panels; notice ink supplies the text contrast.

### Neutral

- **Paper:** the off-white dashboard field.
- **White:** the flat, bordered schedule, history, profile, and neutral empty-state surfaces.

### Named Rules

**The Green-Is-Now Rule.** Botanical green means the current destination or a direct next action; it is not a general decorative fill.

**The Violet-Is-Record Rule.** Ink-violet is for retained state, visible keyboard focus, and quiet supporting punctuation—not the default action colour.

## Typography

**Display Font:** Archivo Black (with sans-serif fallback)

**Body Font:** Inter (with sans-serif fallback)

**Character:** Archivo Black gives member names, Class names, dates, and section headings a compact editorial voice. Inter keeps timings, locations, counts, and instructions quick to scan.

### Hierarchy

- **Display** (400, 3rem on mobile / 3.75rem at `md`, 0.92): the signed-in personal welcome.
- **Public heading** (400, 2.25rem on mobile / 3.75rem at `md`, 0.94): the unauthenticated profile heading; keep it smaller than the dashboard welcome.
- **Sign-in headline** (400, 3rem on mobile / 4rem at `md`, 0.98): the sign-in panel invitation.
- **Headline** (400, 1.875rem on mobile / 2.25rem at `md`, 0.95): the next Class name and major section titles.
- **Body** (400, 1rem, 1.75): explanatory copy, constrained by the layout rather than set as long-form prose.
- **Label** (700, 0.875rem, 1.5): navigation, actions, metadata, status, and counts.
- **Micro** (800, 0.65rem, 0.13em tracking): the uppercase month on schedule calendar blocks.

### Named Rules

**The Name-Then-Fact Rule.** Use display type for a member or Class name; use compact Inter labels for the time, location, status, and count that make it actionable.

## Layout

The page sits in a centred `max-w-7xl` container with 1rem mobile and 2rem medium-screen gutters. On desktop (`lg`), a 15.5rem sticky account rail is anchored beside the content column; account context and section navigation remain available while the member moves through their record. On smaller screens the rail becomes a compact identity row followed by horizontally scrollable section-nav pills.

The reading order remains fixed across breakpoints: overview and next Class, schedule, Booking history with record, then details. Sections are divided by light ink rules and separated by 3rem so the long page reads as a chronological record, not a dense settings screen. At `xl`, history and the fixed-width 13rem record panel form two columns; elsewhere they stack.

## Elevation & Depth

The dashboard is flat by default. Paper and white surfaces are separated by one-pixel low-contrast borders and tonal contrast, not shadows; the next-Class feature and rail gain hierarchy from their charcoal fields rather than lift. Dividers carry the row rhythm, including the white-on-charcoal logistics divider.

### Named Rules

**The Bordered-Record Rule.** Schedule, history, details, rail, and empty-state records stay flat with a light border; reserve tonal fields, not elevation, for hierarchy.

## Shapes

Gently rounded 0.75rem containers organise records, the account rail, attendance panel, and date blocks. Full pills are reserved for direct actions, status labels, and mobile section navigation. Date blocks remain compact calendar silhouettes: a rounded neutral tile for rows and a larger botanical-green tile for the next commitment. The charcoal next-Class card is an uncluttered content field—do not add decorative geometry or ornamental marks.

## Components

### Buttons

**Direct, legible action controls.**

- **Primary:** botanical-green or charcoal full pills, at least 2.75rem high, with bold Inter labels and an arrow where navigation leaves the dashboard.
- **Hover / Focus:** dark actions may shift to charcoal hover; visible focus uses a 4px ink-violet outline with offset.
- **Destructive-adjacent action:** “Cancel Booking” remains an underlined text action, not a filled warning button. It gains ink-violet on paper surfaces and botanical green on the charcoal next-Class card; pending state reduces opacity.

### Booking Status

**Small factual labels that do not replace words with colour.**

- **Shape:** full pill with a 1.75rem minimum height and bold 0.75rem label text.
- **Assignment:** booked is botanical green with dark botanical ink; attended is lilac with muted violet text and a check; cancelled is muted ink; no-show is pink with no-show ink.

### Calendar Blocks

**Calendar-first date anchors for chronological scanning.**

- **Next commitment:** a large botanical-green 5.75rem square with abbreviated uppercase month and Archivo Black date numeral.
- **List row:** a compact 3.5rem neutral block with the same month/date construction.

### Cards / Containers

**Records are flat, contained, and never over-framed.**

- **Next-Class card:** charcoal with white type and a white/15 divider for logistical facts; no decorative geometry.
- **Schedule, history, and details:** white rounded cards with a light ink border; Booking rows use a single low-contrast bottom rule rather than individual card borders.
- **Empty state:** a neutral white, lightly bordered record that offers the next useful action. It has no special coloured fill or colour-coded rule.

### Navigation

**Identity-led section navigation.**

- **Desktop:** a sticky bordered white rail with charcoal identity header, botanical-green initial disk, and stacked Overview, Booking history, and My details links.
- **Mobile:** compact account identity followed by horizontally scrollable pill links; Overview is botanical green and the other destinations are white.
- **State:** inactive desktop links gain a subtle ink wash on hover; keyboard focus is ink-violet and offset from the control.

### Attendance Record

**A quiet factual summary, not a chart.**

- **Style:** muted-record rounded panel with record-ink headings, muted violet labels, subtle violet dividers, and oversized Archivo Black counts.
- **Content:** only attended and no-show totals supplied by the member's real Booking history.

## Do's and Don'ts

### Do:

- **Do** place the next confirmed Class ahead of the schedule, history, and editable details.
- **Do** use botanical green only for the active destination, primary Calendar block, booked status, and direct discovery actions.
- **Do** preserve the desktop account rail and convert it to compact identity plus scrollable pills below `lg`.
- **Do** retain names, times, locations, statuses, and record totals as plain readable text alongside their colour treatment.
- **Do** use flat, bordered record surfaces and a muted attendance panel to keep the long page quiet.

### Don't:

- **Don't** turn the dashboard into a profile-first form or an undifferentiated Booking list.
- **Don't** use ink-violet as a second primary action colour; it denotes record, focus, and supporting punctuation.
- **Don't** add decorative geometry to the next-Class card.
- **Don't** add coloured empty-state treatments, charts, fictional sessions, attendance trends, or placeholder Booking data.
- **Don't** give every row equal visual weight to the next commitment.
