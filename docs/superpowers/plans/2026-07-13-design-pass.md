# Visual Design Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the wedding invitation from plain functional layout to editorial interactive experience with GSAP scroll-driven animations, new typography, and 3D message effects — zero functional changes.

**Architecture:** Add GSAP + ScrollTrigger as single new dependency. Build thin client components for each animation effect (hero zoom, scroll reveal, parallax, gallery lightbox, message flight). Restyle existing CSS modules with new typography. All animation gated on `prefers-reduced-motion`.

**Tech Stack:** GSAP + ScrollTrigger, Google Fonts (Cormorant Garamond + Inter), CSS modules, React client components.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-13-design-pass-design.md`
- **Read `node_modules/next/dist/docs/` for any API questions** — this Next.js version has breaking changes
- No functional changes to storage, API routes, admin, proxy
- Existing tests must still pass: `node --test src/lib/guests.test.ts src/lib/storage.test.ts`
- `npx tsc --noEmit` and `npm run build` must stay clean
- Mobile-first: no horizontal scroll at 375px, all sections readable
- `prefers-reduced-motion`: all GSAP disabled, static layout still correct
- Colors unchanged (will be swapped later)
- Google Fonts: Cormorant Garamond 300,400,600 + Inter 400,500 only

## File Structure

```
Modified:
  src/app/layout.tsx                              — add Google Fonts link
  src/app/globals.css                             — base font → Inter, perspective, parallax base
  src/app/i/[token]/page.tsx                      — restructure sections with animation wrappers
  src/app/i/[token]/invitation.module.css         — full restyle (typography, spacing, remove borders)
  src/app/i/[token]/sections/Countdown.tsx        — restyle with date display

Created:
  src/app/i/[token]/sections/HeroSection.tsx      — client, hero zoom-through animation
  src/app/i/[token]/sections/ScrollReveal.tsx     — client, generic scroll reveal wrapper
  src/app/i/[token]/sections/ParallaxLayers.tsx   — client, decorative parallax elements
  src/app/i/[token]/sections/GalleryGrid.tsx      — client, scroll reveal + lightbox
  src/app/i/[token]/sections/MessageFlight.tsx    — client, 3D scroll-driven messages
```

---

### Task 1: Install GSAP + Google Fonts + base typography

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`
- Modify: `src/app/i/[token]/invitation.module.css`

**Interfaces:**
- Produces: GSAP available as import; fonts loaded; base typography applied globally

- [ ] **Step 1: Install GSAP**

```bash
npm install gsap
```

Verify `gsap` and its `ScrollTrigger` plugin are importable:

```bash
node -e "require('gsap'); require('gsap/ScrollTrigger'); console.log('ok')"
```

- [ ] **Step 2: Add Google Fonts to layout.tsx**

Replace `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import "./globals.css";
import { invitation } from "@/content/invitation";

export const metadata: Metadata = {
  title: `${invitation.couple.partner1} & ${invitation.couple.partner2} — Wedding Invitation`,
  description: `Join us to celebrate our wedding on ${invitation.dateDisplay}.`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=Inter:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 3: Update globals.css**

Replace `src/app/globals.css`:

```css
* { box-sizing: border-box; margin: 0; }
html { -webkit-text-size-adjust: 100%; }
body {
  font-family: 'Inter', sans-serif;
  background: #faf7f2;
  color: #2b2b2b;
  line-height: 1.6;
}
img { max-width: 100%; display: block; }
h1, h2, h3 {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-weight: 600;
  line-height: 1.2;
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
}
```

- [ ] **Step 4: Restyle invitation.module.css — typography and spacing**

Replace `src/app/i/[token]/invitation.module.css`:

```css
.main { max-width: 480px; margin: 0 auto; padding: 0 20px 80px; position: relative; }

/* Hero */
.hero { min-height: 100vh; display: flex; flex-direction: column; justify-content: center; text-align: center; gap: 12px; overflow: hidden; }
.hero h1 { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 2.8rem; font-weight: 300; }
.kicker { text-transform: uppercase; letter-spacing: 0.2em; font-size: 0.75rem; font-family: 'Inter', sans-serif; color: #6b5e50; }
.guest { margin-top: 24px; font-style: italic; color: #6b5e50; }

/* Sections — no border-top, spacing only */
.section { padding: 48px 0; }
.section h2 { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.4rem; font-weight: 600; margin-bottom: 16px; }
.event { margin-bottom: 20px; }

/* Gallery */
.gallery { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.gallery img { border-radius: 8px; cursor: pointer; width: 100%; height: auto; object-fit: cover; }

/* Map */
.map { width: 100%; height: 300px; border: 0; border-radius: 8px; }

/* Forms */
.main input, .main select, .main textarea, .main button {
  font-family: 'Inter', sans-serif; padding: 14px; min-height: 44px; width: 100%;
  border: 1px solid #cbbfa8; border-radius: 8px; background: #fff;
  font-size: 1rem;
}
.main button {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.1rem;
  background: #2b2b2b; color: #faf7f2; border: 0;
  transition: background 0.2s;
}
.main button:active { background: #1a1a1a; }

/* Message wall */
.wall { list-style: none; padding: 0; margin-top: 24px; display: grid; gap: 16px; }
.wall li { background: #fff; border: 1px solid #e5ddd0; border-radius: 8px; padding: 16px; }

/* Countdown */
.countdown { text-align: center; }
.countdownNumbers { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 3rem; color: #b8965a; }
.countdownLabel { font-family: 'Inter', sans-serif; font-size: 0.7rem; color: #6b5e50; text-transform: uppercase; letter-spacing: 0.1em; }
.countdownDate { margin-top: 16px; font-family: 'Inter', sans-serif; color: #6b5e50; }
```

- [ ] **Step 5: Verify**

```bash
npx tsc --noEmit
npm run build
node --test src/lib/guests.test.ts src/lib/storage.test.ts
```

All must pass. Start dev server, check `http://localhost:3000/i/abc123` — fonts should be Cormorant headings + Inter body. No horizontal scroll at 375px.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "style: add GSAP, Google Fonts, base typography restyle"
```

---

### Task 2: Countdown restyle with date display

**Files:**
- Modify: `src/app/i/[token]/sections/Countdown.tsx`
- Modify: `src/app/i/[token]/page.tsx` (pass `dateDisplay` prop)

**Interfaces:**
- Consumes: `invitation.dateDisplay` (string), `invitation.dateISO` (string), CSS classes `.countdown`, `.countdownNumbers`, `.countdownLabel`, `.countdownDate` from `invitation.module.css`
- Produces: restyled `<Countdown>` accepting `{ targetISO: string; dateDisplay: string; styles: Record<string, string> }`

- [ ] **Step 1: Update Countdown.tsx**

Replace `src/app/i/[token]/sections/Countdown.tsx`:

```tsx
"use client";
import { useEffect, useState } from "react";

interface CountdownProps {
  targetISO: string;
  dateDisplay: string;
  styles: Record<string, string>;
}

export default function Countdown({ targetISO, dateDisplay, styles }: CountdownProps) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setLeft(Math.max(0, new Date(targetISO).getTime() - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetISO]);
  if (left === null) return null;
  const d = Math.floor(left / 86400000);
  const h = Math.floor(left / 3600000) % 24;
  const m = Math.floor(left / 60000) % 60;
  const s = Math.floor(left / 1000) % 60;
  return (
    <div className={styles.countdown}>
      <div style={{ display: "flex", justifyContent: "center", gap: 24 }}>
        {[
          { value: d, label: "Days" },
          { value: h, label: "Hours" },
          { value: m, label: "Min" },
          { value: s, label: "Sec" },
        ].map(({ value, label }) => (
          <div key={label}>
            <div className={styles.countdownNumbers}>{value}</div>
            <div className={styles.countdownLabel}>{label}</div>
          </div>
        ))}
      </div>
      <p className={styles.countdownDate}>{dateDisplay}</p>
    </div>
  );
}
```

- [ ] **Step 2: Update page.tsx countdown section**

In `src/app/i/[token]/page.tsx`, change the countdown section from:

```tsx
<Countdown targetISO={inv.dateISO} />
```

to:

```tsx
<Countdown targetISO={inv.dateISO} dateDisplay={inv.dateDisplay} styles={styles} />
```

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit
npm run build
```

Dev server: countdown shows large gold numbers with labels + date below.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "style: restyle countdown with date display"
```

---

### Task 3: ScrollReveal component + section transitions

**Files:**
- Create: `src/app/i/[token]/sections/ScrollReveal.tsx`
- Modify: `src/app/i/[token]/page.tsx` (wrap content sections)

**Interfaces:**
- Produces: `<ScrollReveal>` client component — wraps children, animates `opacity: 0; translateY(40px)` → `opacity: 1; translateY(0)` on viewport entry via GSAP ScrollTrigger. Props: `{ children: React.ReactNode; className?: string }`. No-ops when `prefers-reduced-motion` is active.

- [ ] **Step 1: Create ScrollReveal.tsx**

`src/app/i/[token]/sections/ScrollReveal.tsx`:

```tsx
"use client";
import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
}

export default function ScrollReveal({ children, className }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.set(el, { opacity: 0, y: 40 });
    const trigger = ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      onEnter: () => gsap.to(el, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }),
      once: true,
    });
    return () => trigger.kill();
  }, []);
  return <div ref={ref} className={className}>{children}</div>;
}
```

- [ ] **Step 2: Wrap sections in page.tsx**

In `src/app/i/[token]/page.tsx`, add import:

```tsx
import ScrollReveal from "./sections/ScrollReveal";
```

Wrap each content section (events, countdown, gallery, rsvp, messages, location, dress code — NOT hero) with `<ScrollReveal className={styles.section}>`. Remove the `className={styles.section}` from the `<section>` tags that get wrapped (the wrapper provides it). Keep the `id` attributes on the inner elements where needed (rsvp, messages).

The result for each section should look like:

```tsx
<ScrollReveal className={styles.section}>
  <section>
    <h2>Events</h2>
    {inv.events.map((e) => (
      <div key={e.name} className={styles.event}>
        <h3>{e.name}</h3>
        <p>{e.time} — {e.venue}</p>
        <p>{e.address}</p>
      </div>
    ))}
  </section>
</ScrollReveal>
```

For RSVP and messages, keep the `id` on the inner `<section>`:

```tsx
<ScrollReveal className={styles.section}>
  <section id="rsvp">
    <h2>RSVP</h2>
    <RsvpForm token={token} guestName={guest} />
  </section>
</ScrollReveal>
```

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit
npm run build
```

Dev server: scroll down — sections fade+slide in as they enter viewport. Toggle reduced-motion in devtools — sections visible immediately, no animation.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: scroll reveal section transitions"
```

---

### Task 4: Hero zoom-through entrance

**Files:**
- Create: `src/app/i/[token]/sections/HeroSection.tsx`
- Modify: `src/app/i/[token]/page.tsx` (replace hero section with HeroSection component)
- Modify: `src/app/i/[token]/invitation.module.css` (add hero background styles)

**Interfaces:**
- Produces: `<HeroSection>` client component. Props: `{ partner1: string; partner2: string; dateDisplay: string; guest: string; styles: Record<string, string> }`. Renders a pinned full-viewport hero with zoom-from-1.5x-to-1x scroll animation.

- [ ] **Step 1: Add hero background CSS**

Add to `src/app/i/[token]/invitation.module.css`:

```css
.heroInner {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  gap: 12px;
  background: radial-gradient(ellipse at center, #f5efe6 0%, #faf7f2 70%);
  will-change: transform;
}
.heroContent { position: relative; z-index: 1; }
```

- [ ] **Step 2: Create HeroSection.tsx**

`src/app/i/[token]/sections/HeroSection.tsx`:

```tsx
"use client";
import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface HeroProps {
  partner1: string;
  partner2: string;
  dateDisplay: string;
  guest: string;
  styles: Record<string, string>;
}

export default function HeroSection({ partner1, partner2, dateDisplay, guest, styles }: HeroProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const inner = innerRef.current;
    const content = contentRef.current;
    if (!wrapper || !inner || !content) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.set(inner, { scale: 1.5, filter: "blur(3px)" });
    gsap.set(content.children, { opacity: 0, y: 30 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: wrapper,
        start: "top top",
        end: "bottom top",
        pin: true,
        scrub: 0.8,
      },
    });

    tl.to(inner, { scale: 1, filter: "blur(0px)", duration: 1, ease: "none" }, 0);
    tl.to(content.children, { opacity: 1, y: 0, duration: 0.5, stagger: 0.15, ease: "power2.out" }, 0.3);

    return () => { tl.kill(); ScrollTrigger.getAll().forEach((t) => t.kill()); };
  }, []);

  return (
    <div ref={wrapperRef} className={styles.hero}>
      <div ref={innerRef} className={styles.heroInner}>
        <div ref={contentRef} className={styles.heroContent}>
          <p className={styles.kicker}>The wedding of</p>
          <h1>{partner1} &amp; {partner2}</h1>
          <p>{dateDisplay}</p>
          <p className={styles.guest}>Dear {guest}</p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Update page.tsx**

Import `HeroSection` and replace the hero `<section>` block with:

```tsx
<HeroSection
  partner1={inv.couple.partner1}
  partner2={inv.couple.partner2}
  dateDisplay={inv.dateDisplay}
  guest={guest}
  styles={styles}
/>
```

Remove the old hero `<section>` block entirely.

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit
npm run build
```

Dev server: hero starts zoomed+blurred, scrolling zooms out and reveals text with stagger. Pin releases after animation. Reduced-motion: hero visible normally, no zoom.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: hero zoom-through entrance animation"
```

---

### Task 5: Parallax layers

**Files:**
- Create: `src/app/i/[token]/sections/ParallaxLayers.tsx`
- Modify: `src/app/i/[token]/page.tsx` (add ParallaxLayers)
- Modify: `src/app/i/[token]/invitation.module.css` (parallax container styles)

**Interfaces:**
- Produces: `<ParallaxLayers>` client component. No props. Renders 4 absolutely-positioned decorative gradient circles that move at different scroll speeds. No-ops on reduced motion.

- [ ] **Step 1: Add parallax CSS**

Add to `src/app/i/[token]/invitation.module.css`:

```css
.parallaxContainer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}
.parallaxLayer {
  position: absolute;
  border-radius: 50%;
  will-change: transform;
}
```

Also update `.main` to have `position: relative; z-index: 1;` so content sits above parallax.

- [ ] **Step 2: Create ParallaxLayers.tsx**

`src/app/i/[token]/sections/ParallaxLayers.tsx`:

```tsx
"use client";
import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "../invitation.module.css";

gsap.registerPlugin(ScrollTrigger);

const layers = [
  { size: 120, top: "10%", left: "5%", opacity: 0.07, speed: 0.3, color: "184,150,90" },
  { size: 80, top: "30%", right: "0%", opacity: 0.05, speed: 0.2, color: "184,150,90" },
  { size: 100, top: "55%", left: "10%", opacity: 0.06, speed: 0.4, color: "107,94,80" },
  { size: 60, top: "75%", right: "8%", opacity: 0.08, speed: 0.5, color: "184,150,90" },
];

export default function ParallaxLayers() {
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const triggers: ScrollTrigger[] = [];
    refs.current.forEach((el, i) => {
      if (!el) return;
      const trigger = ScrollTrigger.create({
        trigger: document.documentElement,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          gsap.set(el, { y: self.progress * window.innerHeight * layers[i].speed * -1 });
        },
      });
      triggers.push(trigger);
    });
    return () => triggers.forEach((t) => t.kill());
  }, []);

  return (
    <div className={styles.parallaxContainer}>
      {layers.map((l, i) => (
        <div
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          className={styles.parallaxLayer}
          style={{
            width: l.size,
            height: l.size,
            top: l.top,
            left: l.left,
            right: (l as Record<string, unknown>).right as string | undefined,
            background: `radial-gradient(circle, rgba(${l.color},${l.opacity}), transparent)`,
          }}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Add to page.tsx**

Import `ParallaxLayers` and add it as the first child inside the `<main>` tag, before HeroSection:

```tsx
<main className={styles.main}>
  <ParallaxLayers />
  <HeroSection ... />
  ...
</main>
```

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit
npm run build
```

Dev server: subtle gradient circles visible in background, move at different rates while scrolling. Reduced motion: circles static (no GSAP). No horizontal scroll at 375px.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: parallax background layers"
```

---

### Task 6: Gallery scroll reveal + lightbox

**Files:**
- Create: `src/app/i/[token]/sections/GalleryGrid.tsx`
- Modify: `src/app/i/[token]/page.tsx` (replace gallery with GalleryGrid)
- Modify: `src/app/i/[token]/invitation.module.css` (lightbox styles)

**Interfaces:**
- Produces: `<GalleryGrid>` client component. Props: `{ images: string[]; styles: Record<string, string> }`. Renders 2-col grid with scroll reveal stagger + tap-to-lightbox with zoom + swipe navigation. No-ops reveal on reduced motion (grid still visible).

- [ ] **Step 1: Add lightbox CSS**

Add to `src/app/i/[token]/invitation.module.css`:

```css
/* Lightbox */
.lightboxOverlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.lightboxImage {
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 4px;
  cursor: default;
}
.lightboxClose {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  color: #fff;
  font-size: 2rem;
  cursor: pointer;
  min-height: auto;
  width: auto;
  padding: 8px;
  font-family: 'Inter', sans-serif;
}
```

- [ ] **Step 2: Create GalleryGrid.tsx**

`src/app/i/[token]/sections/GalleryGrid.tsx`:

```tsx
"use client";
import { useRef, useEffect, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface GalleryGridProps {
  images: string[];
  styles: Record<string, string>;
}

export default function GalleryGrid({ images, styles }: GalleryGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const touchStart = useRef<number>(0);

  // Scroll reveal
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const imgs = grid.querySelectorAll("img");
    gsap.set(imgs, { scale: 0.85, opacity: 0 });
    const triggers: ScrollTrigger[] = [];
    imgs.forEach((img, i) => {
      const trigger = ScrollTrigger.create({
        trigger: img,
        start: "top 90%",
        onEnter: () => gsap.to(img, { scale: 1, opacity: 1, duration: 0.5, delay: (i % 2) * 0.05, ease: "power2.out" }),
        once: true,
      });
      triggers.push(trigger);
    });
    return () => triggers.forEach((t) => t.kill());
  }, [images]);

  // Lock scroll when lightbox open
  useEffect(() => {
    if (lightbox !== null) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [lightbox]);

  const handleSwipe = useCallback((e: React.TouchEvent) => {
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) < 50) return;
    setLightbox((prev) => {
      if (prev === null) return null;
      if (diff > 0) return Math.min(prev + 1, images.length - 1);
      return Math.max(prev - 1, 0);
    });
  }, [images.length]);

  return (
    <>
      <div ref={gridRef} className={styles.gallery}>
        {images.map((src, i) => (
          <img key={src} src={src} alt="" loading="lazy" onClick={() => setLightbox(i)} />
        ))}
      </div>
      {lightbox !== null && (
        <div
          className={styles.lightboxOverlay}
          onClick={() => setLightbox(null)}
          onTouchStart={(e) => { touchStart.current = e.touches[0].clientX; }}
          onTouchEnd={handleSwipe}
        >
          <button className={styles.lightboxClose} onClick={() => setLightbox(null)}>×</button>
          <img
            className={styles.lightboxImage}
            src={images[lightbox]}
            alt=""
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 3: Update page.tsx gallery section**

Replace the gallery content:

```tsx
<ScrollReveal className={styles.section}>
  <section>
    <h2>Gallery</h2>
    <GalleryGrid images={inv.gallery} styles={styles} />
  </section>
</ScrollReveal>
```

Import `GalleryGrid` and remove the old inline gallery `<div>`.

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit
npm run build
```

Dev server: gallery images scale-in on scroll with left/right stagger. Tap image → fullscreen lightbox with dark overlay. Swipe left/right navigates. Tap backdrop or × closes. Reduced motion: grid visible, no scale-in, lightbox still works.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: gallery scroll reveal and lightbox"
```

---

### Task 7: 3D message flight

**Files:**
- Create: `src/app/i/[token]/sections/MessageFlight.tsx`
- Modify: `src/app/i/[token]/page.tsx` (replace messages wall with MessageFlight)
- Modify: `src/app/i/[token]/invitation.module.css` (message flight styles)

**Interfaces:**
- Consumes: `Message` type from `@/lib/storage` (id, name, text)
- Produces: `<MessageFlight>` client component. Props: `{ messages: Array<{ id: string; name: string; text: string }>; styles: Record<string, string> }`. Renders scroll-driven 3D fly-through if ≥3 messages, otherwise static list.

- [ ] **Step 1: Add message flight CSS**

Add to `src/app/i/[token]/invitation.module.css`:

```css
/* Message flight */
.messageFlight {
  position: relative;
  height: 150vh;
  perspective: 1000px;
  overflow: visible;
}
.messageCard {
  position: absolute;
  width: 80%;
  left: 10%;
  background: #fff;
  border: 1px solid #e5ddd0;
  border-radius: 12px;
  padding: 20px;
  will-change: transform, opacity;
}
.messageCard strong {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.1rem;
}
.messageCard p {
  margin-top: 8px;
  font-size: 0.95rem;
  line-height: 1.5;
}
```

- [ ] **Step 2: Create MessageFlight.tsx**

`src/app/i/[token]/sections/MessageFlight.tsx`:

```tsx
"use client";
import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface MessageFlightProps {
  messages: Array<{ id: string; name: string; text: string }>;
  styles: Record<string, string>;
}

export default function MessageFlight({ messages, styles }: MessageFlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Fewer than 3 messages or reduced motion: static list
  if (messages.length < 3 || reduced) {
    return (
      <ul className={styles.wall}>
        {messages.map((m) => (
          <li key={m.id}><strong>{m.name}</strong><p>{m.text}</p></li>
        ))}
      </ul>
    );
  }

  return <FlightEffect messages={messages} styles={styles} containerRef={containerRef} />;
}

function FlightEffect({
  messages,
  styles,
  containerRef,
}: {
  messages: MessageFlightProps["messages"];
  styles: Record<string, string>;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const triggers: ScrollTrigger[] = [];
    const spacing = 100 / messages.length;

    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      // Distribute cards with slight x-offset for organic feel
      const xOffset = (i % 2 === 0 ? -1 : 1) * (5 + (i % 3) * 3);

      gsap.set(card, {
        top: `${i * spacing}%`,
        translateZ: -800,
        scale: 0.3,
        opacity: 0,
        x: `${xOffset}%`,
        filter: "blur(2px)",
      });

      const trigger = ScrollTrigger.create({
        trigger: container,
        start: `top+=${(i / messages.length) * 100}% center`,
        end: `top+=${((i + 1) / messages.length) * 100}% center`,
        scrub: 0.5,
        onUpdate: (self) => {
          const p = self.progress;
          gsap.set(card, {
            translateZ: gsap.utils.interpolate(-800, 0, p),
            scale: gsap.utils.interpolate(0.3, 1, p),
            opacity: gsap.utils.interpolate(0, 1, Math.min(p * 2, 1)),
            filter: `blur(${gsap.utils.interpolate(2, 0, p)}px)`,
          });
        },
      });
      triggers.push(trigger);
    });

    return () => triggers.forEach((t) => t.kill());
  }, [messages, containerRef]);

  return (
    <div ref={containerRef} className={styles.messageFlight}>
      {messages.map((m, i) => (
        <div
          key={m.id}
          ref={(el) => { cardRefs.current[i] = el; }}
          className={styles.messageCard}
        >
          <strong>{m.name}</strong>
          <p>{m.text}</p>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Update page.tsx messages section**

Replace the messages wall section. Keep `MessageForm` above the flight. Import `MessageFlight`.

```tsx
<ScrollReveal className={styles.section}>
  <section id="messages">
    <h2>Wishes</h2>
    <MessageForm token={token} guestName={guest} />
    <MessageFlight
      messages={approved.map((m) => ({ id: m.id, name: m.name, text: m.text }))}
      styles={styles}
    />
  </section>
</ScrollReveal>
```

Remove the old `<ul className={styles.wall}>` block.

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit
npm run build
```

Dev server: with 3+ approved messages in `data/messages.json`, the messages fly toward the reader on scroll. With <3 messages, renders as a static styled list. Reduced motion: static list. No horizontal scroll at 375px.

Test with 0, 1, 2, and 5 messages by editing `data/messages.json` status fields.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: 3D scroll-driven message flight"
```

---

### Task 8: Final cleanup + push

**Files:**
- Modify: `src/app/i/[token]/page.tsx` (verify final structure)

**Interfaces:**
- Consumes: all components from Tasks 1-7

- [ ] **Step 1: Verify complete page structure**

Ensure `src/app/i/[token]/page.tsx` imports and uses all components in the correct order:
1. `ParallaxLayers` (first, behind everything)
2. `HeroSection` (not wrapped in ScrollReveal)
3. Events section (wrapped in ScrollReveal)
4. Countdown section (wrapped in ScrollReveal)
5. Gallery section (wrapped in ScrollReveal, uses GalleryGrid)
6. RSVP section (wrapped in ScrollReveal)
7. Messages section (wrapped in ScrollReveal, uses MessageForm + MessageFlight)
8. Location section (wrapped in ScrollReveal)
9. Dress code section (wrapped in ScrollReveal)

- [ ] **Step 2: Full verification**

```bash
npx tsc --noEmit
npm run build
node --test src/lib/guests.test.ts src/lib/storage.test.ts
```

All must pass.

- [ ] **Step 3: Manual mobile check**

Dev server at `http://localhost:3000/i/abc123`:
- 375px viewport: no horizontal scroll, all readable
- Hero zoom works on scroll
- Sections reveal on scroll
- Parallax layers move in background
- Gallery images reveal + lightbox works with touch
- Countdown shows numbers + date
- Messages: test with 3+ approved messages for 3D effect
- `prefers-reduced-motion` in devtools: everything visible, no animations
- Forms still submit correctly (RSVP + message)

- [ ] **Step 4: Commit and push**

```bash
git add -A && git commit -m "feat: complete visual design pass" --allow-empty
git push
```

---

## Deferred

- Color palette swap (awaiting owner's design guidelines)
- Content update (names, dates, images — owner's task)
- Gallery zoom-from-grid-position animation (simplified to overlay for v1; upgrade when real photos available)
