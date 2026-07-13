# Wedding Invitation — Visual Design Pass Spec

Date: 2026-07-13
Status: Approved design, pending user spec review

## Purpose

Restyle the functional wedding invitation site from its current plain layout to an editorial, interactive, mobile-first experience with scroll-driven animations. No functional changes — RSVP, messages, admin, storage all stay as-is.

## Scope

### In scope

- Typography: Cormorant Garamond (headings) + Inter (body) via Google Fonts
- Hero zoom-through entrance (GSAP ScrollTrigger)
- Section transitions: whole-section fade+slide reveal on scroll
- Parallax: 3-4 layered decorative elements at different scroll speeds
- Gallery: 2-column grid with scale reveal + stagger, tap-to-lightbox with zoom + swipe
- Countdown: minimal large typography with actual wedding date displayed
- Messages: scroll-driven 3D text zoom (fly-through), fallback to static list
- Forms (RSVP, message): elevated typography and spacing, no animation/parallax
- `prefers-reduced-motion` support: all GSAP disabled, static layout
- Single new dependency: GSAP + ScrollTrigger

### Out of scope

- Color palette changes (defer to real design guidelines from owner)
- Content changes (names, dates, images — owner's task)
- Functional changes to RSVP, messages, admin, storage
- Additional sections (love story, gift info)

## Change Expectation

Colors and content will be swapped later. This spec builds the animation/layout framework that survives those changes.

## Dependencies

- **GSAP** (gsap + @gsap/react if useful, ScrollTrigger plugin) — free for personal use
- No other new dependencies

## Typography

| Role | Font | Weight | Size (mobile) |
|---|---|---|---|
| Couple names (hero h1) | Cormorant Garamond | 300 (light) | ~2.8rem |
| Section headings (h2) | Cormorant Garamond | 600 (semibold) | ~1.4rem |
| Countdown numbers | Cormorant Garamond | 400 | ~3rem |
| Body text | Inter | 400 | 1rem (16px) |
| Kicker ("The wedding of") | Inter | 400, uppercase, 0.2em spacing | 0.75rem |
| Form labels/inputs | Inter | 400 | inherit |

Load via Google Fonts: Cormorant Garamond 300,400,600 + Inter 400,500. Keep it to these weights only.

## Color System

Unchanged from current implementation. Reference values:

- Background: `#faf7f2`
- Text primary: `#2b2b2b`
- Text secondary: `#6b5e50` (new, for subtitles/labels — use sparingly)
- Accent: `#b8965a` (new, for countdown numbers, highlights — use sparingly)
- Card bg: `#ffffff`
- Divider: `#e5ddd0`
- Hero overlay: `rgba(43, 43, 43, 0.3)`

Colors are deliberately minimal and will be replaced when the owner provides a design guideline.

## Hero Section — Zoom-Through Entrance

Full viewport height. Background: hero photo if available, otherwise a subtle radial gradient on the cream background so the zoom effect still reads without an image.

Animation sequence on scroll (GSAP ScrollTrigger, pinned):
1. Initial state: view at scale(1.5), slight blur (2-4px), text invisible
2. As user scrolls: scale animates to 1.0, blur clears to 0
3. Text content fades in with upward drift (translateY 30px → 0): kicker first, couple names, date, then "Dear {guest}"
4. Pin releases, normal scroll continues into events section

ScrollTrigger config: pin the hero, scrub tied to scroll position, ~1 viewport of scroll distance for the full animation.

Fallback (no JS / reduced motion): hero visible at scale(1), text visible, no animation. Still looks correct.

## Section Transitions — Reveal on Scroll

Remove all `border-top` dividers between sections.

Each section: starts at `opacity: 0; transform: translateY(40px)`, transitions to `opacity: 1; transform: translateY(0)` when entering viewport. Triggered via ScrollTrigger with `start: "top 85%"`. Whole section animates as one block (not staggered children). Duration ~0.6s, ease: power2.out.

Exceptions:
- Hero (has its own zoom animation)
- RSVP and message form sections: reveal yes, but no parallax layer behind them (forms need visual stability for interaction)

## Parallax Layers

3-4 decorative elements positioned absolutely behind content:
- Soft gradient circles (radial-gradient, muted gold/cream tones, large radius, low opacity 0.05-0.1)
- Different sizes (60px-120px) and positions scattered across the page
- Each moves at a different rate relative to scroll (0.2x-0.5x via ScrollTrigger)
- z-index behind content, pointer-events: none
- Not rendered inside form sections

Implementation: a `<ParallaxLayer>` client component that places positioned divs and wires them to ScrollTrigger. Rendered once in the page, outside the section flow.

## Gallery — Reveal + Lightbox

### Grid
2-column CSS grid, gap 12px (keep current). Images get `border-radius: 8px`.

### Scroll reveal
Each image: starts at `scale(0.85); opacity: 0`, animates to `scale(1); opacity: 1` on viewport entry. Left column images trigger slightly before right column (~50ms stagger) for a cascade effect. ScrollTrigger `start: "top 90%"`.

### Lightbox
Tap a photo → fullscreen overlay:
1. Calculate tapped image's bounding rect
2. Clone/animate image from its grid position to centered fullscreen (GSAP tween, ~0.4s)
3. Dark backdrop fades in (`rgba(0,0,0,0.9)`)
4. Swipe left/right to navigate between photos (touch events, translateX)
5. Tap backdrop or X button to close: reverse zoom animation back to grid position
6. Scroll locked while lightbox is open (`overflow: hidden` on body)

Built as a client component `<Lightbox>`. No external library. ~60-80 lines.

## Countdown — Minimal with Date

Large Cormorant Garamond numbers in accent color (`#b8965a`). Format: `150 days  3 hours  20 min  5 sec` with small Inter labels beneath each number. Below the countdown, display the actual wedding date in body text: "Saturday, 12 December 2026" from `invitation.dateDisplay`.

No flip animation, no circular gauges. Clean typography is the design.

## Messages — Scroll-Driven 3D Text Zoom

The standout interaction. Section height: ~150vh (extra scroll room for the effect).

CSS perspective container (`perspective: 1000px`) wrapping the message cards. As the user scrolls through the section, each approved message card:
1. Starts far away: `translateZ(-800px); scale(0.3); opacity: 0; filter: blur(2px)`
2. Flies toward the reader, reaching full size at the center of the viewport
3. Continues past and exits upward

Each card positioned at slightly different x-offset and z-depth for organic, non-grid feel. GSAP ScrollTrigger maps scroll progress to each card's z-position.

Message form (submit wishes) sits ABOVE the 3D message flight, in normal flow, with standard reveal animation. The 3D effect applies only to the approved-messages display below it.

### Fallback
When fewer than 3 approved messages exist: skip the 3D effect entirely, render as a simple styled list with standard section reveal. The effect only works with enough content to fill the scroll distance.

### Reduced motion
Static list layout, no 3D, no scroll-driven animation.

## Forms (RSVP + Message)

No structural changes. Styling upgrades only:
- Font switched to Inter (via global change)
- Input/textarea/select: slightly larger padding (14px), softer border color
- Button: Cormorant Garamond text, slightly larger font size, subtle hover/active state (darken background)
- Success/error messages: Inter, appropriate color
- Sections reveal on scroll (standard animation), no parallax behind them

## Motion Safety

All GSAP-driven animations gated on `prefers-reduced-motion`:
- On init, check `window.matchMedia('(prefers-reduced-motion: reduce)')`. If true, do not register any ScrollTrigger animations. CSS already has `animation: none !important; transition: none !important` from globals.css.
- Result: hero visible at normal scale, all sections visible with no transform, gallery grid visible, messages as static list, countdown static. Fully readable, just no motion.
- Listen for `change` event on the media query to handle runtime toggle.

## Architecture

All animation logic in new client components/hooks. No changes to:
- `src/lib/storage.ts`, `src/lib/guests.ts`, `src/lib/admin-auth.ts`
- `src/app/api/` routes
- `src/app/admin/` pages
- `src/proxy.ts`

Files to modify:
- `src/app/layout.tsx` — add Google Fonts (Cormorant Garamond, Inter)
- `src/app/globals.css` — update base font to Inter, add perspective/parallax base styles
- `src/app/i/[token]/page.tsx` — wrap sections with animation components, add parallax layer
- `src/app/i/[token]/invitation.module.css` — restyle all sections (typography, spacing, remove border-top)
- `src/app/i/[token]/sections/Countdown.tsx` — add date display, restyle

Files to create:
- `src/app/i/[token]/sections/HeroSection.tsx` — client component, hero zoom animation
- `src/app/i/[token]/sections/ScrollReveal.tsx` — client component wrapper, reveal-on-scroll
- `src/app/i/[token]/sections/ParallaxLayers.tsx` — client component, decorative parallax elements
- `src/app/i/[token]/sections/GalleryGrid.tsx` — client component, scroll reveal + lightbox
- `src/app/i/[token]/sections/MessageFlight.tsx` — client component, 3D scroll-driven messages

## Testing

1. Manual: verify on mobile viewport (375px) — no horizontal scroll, all sections readable, animations smooth
2. Manual: `prefers-reduced-motion` toggle in devtools — all motion disabled, layout still correct
3. Manual: lightbox open/close/swipe on touch device or devtools touch simulation
4. Manual: messages 3D effect with 0, 1, 2, 5+ approved messages — fallback triggers correctly at <3
5. Existing tests (`make test`) must still pass (no functional changes)
6. `make lint` (tsc + tests) must pass
