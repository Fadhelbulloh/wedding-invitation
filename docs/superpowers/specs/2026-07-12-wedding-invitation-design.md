# Wedding Invitation Website — Design Spec

Date: 2026-07-12
Status: Approved design, pending user spec review

## Purpose

A self-hosted online wedding invitation website. Developed, deployed, and hosted by the owner on a personal VPS with a personal domain. Guests open a unique invitation link, read the invitation, RSVP, and leave a public message. The site must be strongly mobile-optimized because most guests open invitations on phones.

## Scope

### In scope (v1)

- Single-page invitation with these sections, in order:
  1. Hero — couple names, wedding date
  2. Event details — schedule, venue info
  3. Countdown to the wedding date
  4. Gallery — photos
  5. RSVP form
  6. Public message wall (approved messages only)
  7. Location map
  8. Dress code / notes
- Per-guest unique token links
- RSVP submission
- Guest message submission with owner approval before display
- Minimal admin page for message moderation and RSVP inspection
- File-based JSON storage for all dynamic data

### Out of scope (v1)

- Love story section, gift info section
- CMS or admin content editing (all invitation content hardcoded)
- Database
- Multi-language
- Email/notification integrations

## Change Expectation

The design and invitation content are likely to be modified in the future. Implementation should keep content centralized (single content module) and sections/styling modular so later changes stay cheap and low-risk.

## Key Decisions

| Decision | Choice |
|---|---|
| Base scope | Single page + RSVP + public message box |
| Content management | Hardcoded in code, update by redeploy |
| Message storage | File-based storage on VPS |
| Message visibility | Public wall, owner approval before visible |
| Access model | Unique guest token per invitation link |
| Visual direction | Editorial/luxury layout (Style C), unconventional interactive design (3D zoom scroll / interactive moments) |
| Performance stance | Balanced: memorable effects with broad device support |
| RSVP fields | Attendance + guest name + number of attendees + short note |
| Images | Local files in repo, deployed with site |

## Architecture

Single Next.js project.

- **Public invitation route** — one route resolving a guest token (e.g. `/i/[token]`). Invalid or missing token shows a polite generic invitation-unavailable page with no RSVP/message capability.
- **Static content** — names, dates, text, schedule, dress code, and image references hardcoded in code / a content module. Images stored as local repo assets.
- **API routes** — small server endpoints for RSVP submission and message submission. Writes only for valid tokens.
- **Storage** — file-based JSON in a private data directory on the VPS, outside the public/static tree and outside the repo working files that get overwritten on deploy. Append-friendly structure. Approved messages kept separate from pending/rejected for simple public reads.
- **Guest tokens** — stored in a local config file mapping token → guest name (used for prefill and identifying RSVPs).
- **Admin** — secret internal route protected by a server-side password/session (single operator). Capabilities: list pending messages, approve/reject, view RSVP list.

## Data Model (file-based JSON)

- `guests` — token, display name
- `rsvps` — token, guest name, attendance (yes/no), attendee count, short note, timestamp
- `messages` — id, token, author name, message text, status (pending/approved/rejected), timestamp

Public message wall reads only approved messages. Submissions tied to token for identification and basic rate limiting/abuse control.

## Page Flow (mobile-first)

1. Guest opens unique URL → editorial hero with strong first impression
2. Scroll: event details → countdown → gallery → RSVP → message wall → map → dress code
3. RSVP placed before the message wall so the critical action comes before long scrolling
4. Guest name may be prefilled from token
5. Message wall shows approved messages from all guests

Mobile layout rules: single column, thumb-friendly controls, large tap targets, low text density.

## Interaction / Motion Design

Unconventional, premium feel — within a mobile performance budget:

- 3D-like depth, zoom, parallax, reveal sequences, interactive transitions in hero, gallery, and detail sections
- No heavy effects on RSVP form, map, or message submission
- Respect `prefers-reduced-motion`
- Degraded path stays readable if animation underperforms on weak devices
- Motion built on native scroll, CSS transforms, and small focused interaction layers; 3D moments are accents, not core navigation
- Specific animation libraries/techniques deferred to implementation planning (user request)

Success metric: distinctive and premium feel, and guests can reach RSVP within seconds and submit on a mediocre mobile connection.

## Error Handling

- Invalid token: generic unavailable page, no write endpoints usable
- Write failures (disk/IO): user-visible retry message; never silently drop an RSVP
- Duplicate RSVP from same token: latest submission wins (overwrite), keeping operation simple for guests who change plans
- Message submissions validated server-side: length limits, required fields, token check

## Operations

- Deploy: owner builds and runs on personal VPS behind their domain
- Backups: periodically copy the private data directory off the VPS
- No DB, no CMS, no external services

## Testing

1. Mobile viewport behavior at common widths
2. RSVP/message write flow with token validation (one focused automated check)
3. Motion performance guardrails and reduced-motion fallback (manual verification on real phone)

No large test harness for v1.
