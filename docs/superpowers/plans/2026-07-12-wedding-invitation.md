# Wedding Invitation Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mobile-first single-page wedding invitation with per-guest token links, RSVP, moderated public message wall, file-based JSON storage, self-hosted on a VPS.

**Architecture:** One Next.js (App Router) project. Public route `/i/[token]` renders hardcoded content from a single content module. API routes write RSVPs and messages to JSON files in a private data directory. A password-gated `/admin` route moderates messages and lists RSVPs.

**Tech Stack:** Next.js (App Router, TypeScript), plain CSS modules, Node built-in test runner (`node --test`). No DB, no CMS, no animation libraries yet (deferred per spec).

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-12-wedding-invitation-design.md`
- **This Next.js version has breaking changes vs training data. Before writing code for any task, read the relevant guide in `node_modules/next/dist/docs/` and adapt the code samples in this plan to the installed version's APIs.** Code in this plan is a starting point, not gospel.
- Node >= 22.18 (native TypeScript type stripping for `node --test` on `.ts` files)
- No new runtime dependencies beyond what `create-next-app` installs
- All dynamic data lives in `DATA_DIR` (env var, default `./data`), gitignored
- Mobile-first: single column, large tap targets; respect `prefers-reduced-motion`
- Content centralized in `src/content/invitation.ts` (spec: design/content will change later)
- Git identity already configured; commit after each task; branch `master`; remote `origin` exists

## File Structure

```
src/content/invitation.ts        # all hardcoded invitation content
src/lib/storage.ts               # JSON file read/write, rsvps + messages
src/lib/storage.test.ts          # storage tests (node --test)
src/lib/guests.ts                # token -> guest lookup
src/lib/guests.test.ts
src/lib/admin-auth.ts            # password hash helpers
src/app/i/[token]/page.tsx       # invitation page
src/app/i/[token]/sections/*.tsx # one component per section
src/app/api/rsvp/route.ts
src/app/api/messages/route.ts
src/app/api/admin/login/route.ts
src/app/api/admin/messages/route.ts
src/app/admin/page.tsx
src/app/admin/login/page.tsx
src/middleware.ts                # guards /admin
data/guests.example.json         # committed example; real data/guests.json gitignored
README.md                        # deploy + backup notes
```

---

### Task 1: Scaffold Next.js project

**Files:**
- Create: entire app via `create-next-app` in the existing repo root
- Modify: `.gitignore` (add `data/`)

**Interfaces:**
- Produces: runnable Next.js app, `npm run dev`, `npm run build`

- [ ] **Step 1: Scaffold**

Run in repo root (flags may differ — check `npx create-next-app@latest --help` first):

```bash
npx create-next-app@latest . --ts --app --no-eslint --no-tailwind --src-dir --use-npm --skip-install=false
```

If it refuses a non-empty directory, scaffold into a temp dir and move files in, preserving `.git/`, `docs/`, `.gitignore` entries.

- [ ] **Step 2: Read the new Next.js docs**

Read `node_modules/next/dist/docs/` — at minimum the guides covering: App Router pages, dynamic route params, route handlers (API), middleware, server/client components, `next.config`. Note anything that invalidates code later in this plan and adapt.

- [ ] **Step 3: Verify dev server**

Run: `npm run dev` — expect the default page at `http://localhost:3000`. Stop it.

- [ ] **Step 4: Gitignore data dir**

Append to `.gitignore`:

```
data/
```

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "chore: scaffold Next.js app"
```

---

### Task 2: Content module + guest lookup

**Files:**
- Create: `src/content/invitation.ts`, `src/lib/guests.ts`, `src/lib/guests.test.ts`, `data/guests.example.json`

**Interfaces:**
- Produces: `invitation` object (typed); `getGuest(token: string): Promise<string | null>` returning display name or null

- [ ] **Step 1: Write content module**

`src/content/invitation.ts` — placeholder real-ish content, all sections from spec:

```ts
export const invitation = {
  couple: { partner1: "Fadhel", partner2: "Partner" },
  dateISO: "2026-12-12T09:00:00+07:00",
  dateDisplay: "Saturday, 12 December 2026",
  events: [
    { name: "Akad", time: "09:00", venue: "Venue Name", address: "Street, City" },
    { name: "Reception", time: "11:00", venue: "Venue Name", address: "Street, City" },
  ],
  mapEmbedUrl: "https://www.google.com/maps/embed?pb=REPLACE_ME",
  gallery: ["/gallery/1.jpg", "/gallery/2.jpg", "/gallery/3.jpg"],
  dressCode: { title: "Dress Code", text: "Formal / batik. Earth tones appreciated." },
};
export type Invitation = typeof invitation;
```

- [ ] **Step 2: Write failing guests test**

`src/lib/guests.test.ts`:

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

test("getGuest resolves known token, null for unknown", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "guests-"));
  await writeFile(path.join(dir, "guests.json"), JSON.stringify({ abc123: "Budi & Family" }));
  process.env.DATA_DIR = dir;
  const { getGuest } = await import("./guests.ts");
  assert.equal(await getGuest("abc123"), "Budi & Family");
  assert.equal(await getGuest("nope"), null);
});
```

- [ ] **Step 3: Run test, verify it fails**

Run: `node --test src/lib/guests.test.ts`
Expected: FAIL (module not found)

- [ ] **Step 4: Implement `src/lib/guests.ts`**

```ts
import { promises as fs } from "node:fs";
import path from "node:path";

export async function getGuest(token: string): Promise<string | null> {
  const dataDir = process.env.DATA_DIR ?? path.join(process.cwd(), "data");
  try {
    const guests: Record<string, string> = JSON.parse(
      await fs.readFile(path.join(dataDir, "guests.json"), "utf8"),
    );
    return guests[token] ?? null;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }
}
```

- [ ] **Step 5: Run test, verify pass**

Run: `node --test src/lib/guests.test.ts` — Expected: PASS

- [ ] **Step 6: Add example guests file**

`data/guests.example.json`:

```json
{ "abc123": "Budi & Family", "def456": "Sari" }
```

Copy it to `data/guests.json` locally for dev (stays gitignored).

- [ ] **Step 7: Commit**

```bash
git add src/content src/lib/guests.ts src/lib/guests.test.ts data/guests.example.json
git commit -m "feat: content module and guest token lookup"
```

---

### Task 3: File-based storage (RSVPs + messages)

**Files:**
- Create: `src/lib/storage.ts`, `src/lib/storage.test.ts`

**Interfaces:**
- Produces:
  - `type Rsvp = { token: string; name: string; attending: boolean; count: number; note: string; updatedAt: string }`
  - `type Message = { id: string; token: string; name: string; text: string; status: "pending" | "approved" | "rejected"; createdAt: string }`
  - `saveRsvp(r: Omit<Rsvp, "updatedAt">): Promise<void>` — latest per token wins
  - `listRsvps(): Promise<Rsvp[]>`
  - `addMessage(m: { token: string; name: string; text: string }): Promise<Message>` — status starts `"pending"`; throws `Error("rate_limited")` after 5 messages per token
  - `listMessages(status?: Message["status"]): Promise<Message[]>`
  - `setMessageStatus(id: string, status: "approved" | "rejected"): Promise<void>`

- [ ] **Step 1: Write failing tests**

`src/lib/storage.test.ts`:

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { saveRsvp, listRsvps, addMessage, listMessages, setMessageStatus } from "./storage.ts";

async function freshDir() {
  process.env.DATA_DIR = await mkdtemp(path.join(tmpdir(), "store-"));
}

test("saveRsvp: latest per token wins", async () => {
  await freshDir();
  await saveRsvp({ token: "t1", name: "Budi", attending: true, count: 2, note: "" });
  await saveRsvp({ token: "t1", name: "Budi", attending: false, count: 0, note: "sorry" });
  const all = await listRsvps();
  assert.equal(all.length, 1);
  assert.equal(all[0].attending, false);
});

test("messages: pending by default, approve flow, rate limit", async () => {
  await freshDir();
  const m = await addMessage({ token: "t1", name: "Budi", text: "Congrats!" });
  assert.equal(m.status, "pending");
  assert.equal((await listMessages("approved")).length, 0);
  await setMessageStatus(m.id, "approved");
  assert.equal((await listMessages("approved")).length, 1);
  for (let i = 0; i < 4; i++) await addMessage({ token: "t1", name: "B", text: "x" });
  await assert.rejects(addMessage({ token: "t1", name: "B", text: "x" }), /rate_limited/);
});

// Note: storage.ts must read process.env.DATA_DIR at call time (it does — dataDir()
// is a function), so per-test env swaps work without module cache-busting.
```

- [ ] **Step 2: Run tests, verify fail**

Run: `node --test src/lib/storage.test.ts` — Expected: FAIL (module not found)

- [ ] **Step 3: Implement `src/lib/storage.ts`**

```ts
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

export type Rsvp = { token: string; name: string; attending: boolean; count: number; note: string; updatedAt: string };
export type Message = { id: string; token: string; name: string; text: string; status: "pending" | "approved" | "rejected"; createdAt: string };

function dataDir() {
  return process.env.DATA_DIR ?? path.join(process.cwd(), "data");
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(path.join(dataDir(), file), "utf8")) as T;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return fallback;
    throw err;
  }
}

async function writeJson(file: string, value: unknown): Promise<void> {
  await fs.mkdir(dataDir(), { recursive: true });
  const tmp = path.join(dataDir(), `${file}.tmp`);
  await fs.writeFile(tmp, JSON.stringify(value, null, 2));
  await fs.rename(tmp, path.join(dataDir(), file));
}

export async function saveRsvp(r: Omit<Rsvp, "updatedAt">): Promise<void> {
  const all = await readJson<Record<string, Rsvp>>("rsvps.json", {});
  all[r.token] = { ...r, updatedAt: new Date().toISOString() };
  await writeJson("rsvps.json", all);
}

export async function listRsvps(): Promise<Rsvp[]> {
  return Object.values(await readJson<Record<string, Rsvp>>("rsvps.json", {}));
}

export async function addMessage(m: { token: string; name: string; text: string }): Promise<Message> {
  const all = await readJson<Message[]>("messages.json", []);
  if (all.filter((x) => x.token === m.token).length >= 5) throw new Error("rate_limited");
  const msg: Message = { ...m, id: randomUUID(), status: "pending", createdAt: new Date().toISOString() };
  all.push(msg);
  await writeJson("messages.json", all);
  return msg;
}

export async function listMessages(status?: Message["status"]): Promise<Message[]> {
  const all = await readJson<Message[]>("messages.json", []);
  return status ? all.filter((m) => m.status === status) : all;
}

export async function setMessageStatus(id: string, status: "approved" | "rejected"): Promise<void> {
  const all = await readJson<Message[]>("messages.json", []);
  const msg = all.find((m) => m.id === id);
  if (!msg) throw new Error("not_found");
  msg.status = status;
  await writeJson("messages.json", all);
}
```

`ponytail:` file-per-collection JSON, whole-file rewrite per write. Ceiling ~hundreds of guests. Upgrade path: SQLite. Fine for one wedding.

- [ ] **Step 4: Run tests, verify pass**

Run: `node --test src/lib/storage.test.ts` — Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/storage.ts src/lib/storage.test.ts
git commit -m "feat: file-based storage for rsvps and messages"
```

---

### Task 4: Invitation page `/i/[token]` with static sections

**Files:**
- Create: `src/app/i/[token]/page.tsx`, `src/app/i/[token]/invitation.module.css`, `src/app/i/[token]/sections/Countdown.tsx`
- Modify: `src/app/globals.css` (mobile baseline), `src/app/page.tsx` (root shows generic unavailable message)

**Interfaces:**
- Consumes: `invitation` from Task 2, `getGuest` from Task 2
- Produces: rendered sections in spec order: hero, event details, countdown, gallery, (RSVP placeholder), (message wall placeholder), map, dress code. RSVP/messages wired in Tasks 5–6.

**Check `node_modules/next/dist/docs/` for the current dynamic-params API before writing `page.tsx`.**

- [ ] **Step 1: Mobile baseline in `src/app/globals.css`**

Replace scaffolded styles with:

```css
* { box-sizing: border-box; margin: 0; }
html { -webkit-text-size-adjust: 100%; }
body { font-family: Georgia, "Times New Roman", serif; background: #faf7f2; color: #2b2b2b; line-height: 1.6; }
img { max-width: 100%; display: block; }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
}
```

- [ ] **Step 2: Invitation page**

`src/app/i/[token]/page.tsx` (adapt params API to installed Next version):

```tsx
import { notFound } from "next/navigation";
import { invitation } from "@/content/invitation";
import { getGuest } from "@/lib/guests";
import Countdown from "./sections/Countdown";
import styles from "./invitation.module.css";

export default async function InvitationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const guest = await getGuest(token);
  if (!guest) notFound();
  const inv = invitation;
  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <p className={styles.kicker}>The wedding of</p>
        <h1>{inv.couple.partner1} &amp; {inv.couple.partner2}</h1>
        <p>{inv.dateDisplay}</p>
        <p className={styles.guest}>Dear {guest}</p>
      </section>
      <section className={styles.section}>
        <h2>Events</h2>
        {inv.events.map((e) => (
          <div key={e.name} className={styles.event}>
            <h3>{e.name}</h3>
            <p>{e.time} — {e.venue}</p>
            <p>{e.address}</p>
          </div>
        ))}
      </section>
      <section className={styles.section}>
        <h2>Counting down</h2>
        <Countdown targetISO={inv.dateISO} />
      </section>
      <section className={styles.section}>
        <h2>Gallery</h2>
        <div className={styles.gallery}>
          {inv.gallery.map((src) => <img key={src} src={src} alt="" loading="lazy" />)}
        </div>
      </section>
      <section className={styles.section} id="rsvp">
        <h2>RSVP</h2>
        {/* Task 5 */}
      </section>
      <section className={styles.section} id="messages">
        <h2>Wishes</h2>
        {/* Task 6 */}
      </section>
      <section className={styles.section}>
        <h2>Location</h2>
        <iframe src={inv.mapEmbedUrl} className={styles.map} loading="lazy" />
      </section>
      <section className={styles.section}>
        <h2>{inv.dressCode.title}</h2>
        <p>{inv.dressCode.text}</p>
      </section>
    </main>
  );
}
```

- [ ] **Step 3: Section styles**

`src/app/i/[token]/invitation.module.css`:

```css
.main { max-width: 480px; margin: 0 auto; padding: 0 20px 80px; }
.hero { min-height: 90vh; display: flex; flex-direction: column; justify-content: center; text-align: center; gap: 12px; }
.hero h1 { font-size: 2.2rem; font-weight: normal; }
.kicker { text-transform: uppercase; letter-spacing: 0.2em; font-size: 0.75rem; }
.guest { margin-top: 24px; font-style: italic; }
.section { padding: 48px 0; border-top: 1px solid #e5ddd0; }
.section h2 { font-size: 1.4rem; margin-bottom: 16px; }
.event { margin-bottom: 20px; }
.gallery { display: grid; gap: 12px; }
.map { width: 100%; height: 300px; border: 0; border-radius: 8px; }
```

- [ ] **Step 4: Countdown client component**

`src/app/i/[token]/sections/Countdown.tsx`:

```tsx
"use client";
import { useEffect, useState } from "react";

export default function Countdown({ targetISO }: { targetISO: string }) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setLeft(Math.max(0, new Date(targetISO).getTime() - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetISO]);
  if (left === null) return null;
  const d = Math.floor(left / 86400000), h = Math.floor(left / 3600000) % 24,
    m = Math.floor(left / 60000) % 60, s = Math.floor(left / 1000) % 60;
  return <p style={{ fontSize: "1.3rem", textAlign: "center" }}>{d}d {h}h {m}m {s}s</p>;
}
```

- [ ] **Step 5: Root page = generic unavailable**

Replace `src/app/page.tsx` content:

```tsx
export default function Home() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, textAlign: "center" }}>
      <p>This invitation link is not available. Please check the link you received.</p>
    </main>
  );
}
```

Also make `notFound()` render acceptably (default not-found page is fine; optionally add `src/app/not-found.tsx` with the same message).

- [ ] **Step 6: Manual verify**

Run `npm run dev`. Check `http://localhost:3000/i/abc123` (valid, shows "Dear Budi & Family") and `/i/wrong` (unavailable). Use browser devtools mobile viewport 375px — single column, no horizontal scroll.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: invitation page with static sections and countdown"
```

---

### Task 5: RSVP API + form

**Files:**
- Create: `src/app/api/rsvp/route.ts`, `src/app/i/[token]/sections/RsvpForm.tsx`
- Modify: `src/app/i/[token]/page.tsx` (mount form in RSVP section)

**Interfaces:**
- Consumes: `getGuest`, `saveRsvp`
- Produces: `POST /api/rsvp` accepting JSON `{ token, name, attending, count, note }`; responses `204`, `400` (validation), `403` (bad token), `500`

**Check `node_modules/next/dist/docs/` route-handler guide first.**

- [ ] **Step 1: API route**

`src/app/api/rsvp/route.ts`:

```ts
import { getGuest } from "@/lib/guests";
import { saveRsvp } from "@/lib/storage";

export async function POST(req: Request) {
  let body: { token?: string; name?: string; attending?: boolean; count?: number; note?: string };
  try { body = await req.json(); } catch { return new Response("bad json", { status: 400 }); }
  const { token, name, attending, count, note } = body;
  if (!token || !(await getGuest(token))) return new Response("invalid token", { status: 403 });
  if (typeof name !== "string" || !name.trim() || name.length > 100) return new Response("invalid name", { status: 400 });
  if (typeof attending !== "boolean") return new Response("invalid attending", { status: 400 });
  const n = Number(count);
  if (!Number.isInteger(n) || n < 0 || n > 10) return new Response("invalid count", { status: 400 });
  if (typeof note !== "string" || note.length > 500) return new Response("invalid note", { status: 400 });
  try {
    await saveRsvp({ token, name: name.trim(), attending, count: n, note });
  } catch {
    return new Response("storage error, please retry", { status: 500 });
  }
  return new Response(null, { status: 204 });
}
```

- [ ] **Step 2: RSVP form component**

`src/app/i/[token]/sections/RsvpForm.tsx`:

```tsx
"use client";
import { useState } from "react";

export default function RsvpForm({ token, guestName }: { token: string; guestName: string }) {
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">("idle");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("saving");
    const f = new FormData(e.currentTarget);
    const res = await fetch("/api/rsvp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        name: f.get("name"),
        attending: f.get("attending") === "yes",
        count: Number(f.get("count")),
        note: f.get("note") ?? "",
      }),
    }).catch(() => null);
    setState(res?.ok ? "done" : "error");
  }
  if (state === "done") return <p>Thank you! Your RSVP has been recorded.</p>;
  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
      <input name="name" defaultValue={guestName} required maxLength={100} placeholder="Your name" />
      <select name="attending" required>
        <option value="yes">Joyfully attending</option>
        <option value="no">Regretfully declining</option>
      </select>
      <input name="count" type="number" min="0" max="10" defaultValue="1" required placeholder="Number of guests" />
      <textarea name="note" maxLength={500} placeholder="Note (optional)" rows={3} />
      <button disabled={state === "saving"}>{state === "saving" ? "Sending..." : "Send RSVP"}</button>
      {state === "error" && <p role="alert">Could not save. Please try again.</p>}
    </form>
  );
}
```

Style inputs/buttons for touch in `invitation.module.css` (min-height 44px):

```css
.main input, .main select, .main textarea, .main button {
  font: inherit; padding: 12px; min-height: 44px; width: 100%;
  border: 1px solid #cbbfa8; border-radius: 8px; background: #fff;
}
.main button { background: #2b2b2b; color: #faf7f2; border: 0; }
```

- [ ] **Step 3: Mount in page**

In `page.tsx` RSVP section replace the Task-5 placeholder comment with:

```tsx
<RsvpForm token={token} guestName={guest} />
```

and import it.

- [ ] **Step 4: Verify with curl + browser**

```bash
curl -s -o /dev/null -w "%{http_code}" -X POST localhost:3000/api/rsvp -H 'Content-Type: application/json' -d '{"token":"wrong","name":"x","attending":true,"count":1,"note":""}'
```

Expected: `403`. Then submit the form in browser as `abc123`; check `data/rsvps.json` contains the entry.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: rsvp api and form"
```

---

### Task 6: Message wall (submit + approved display)

**Files:**
- Create: `src/app/api/messages/route.ts`, `src/app/i/[token]/sections/MessageForm.tsx`
- Modify: `src/app/i/[token]/page.tsx`

**Interfaces:**
- Consumes: `getGuest`, `addMessage`, `listMessages`
- Produces: `POST /api/messages` JSON `{ token, name, text }` → `201` `{ id }`, `400`, `403`, `429` (rate limited), `500`. Approved messages rendered server-side in the page.

- [ ] **Step 1: API route**

`src/app/api/messages/route.ts`:

```ts
import { getGuest } from "@/lib/guests";
import { addMessage } from "@/lib/storage";

export async function POST(req: Request) {
  let body: { token?: string; name?: string; text?: string };
  try { body = await req.json(); } catch { return new Response("bad json", { status: 400 }); }
  const { token, name, text } = body;
  if (!token || !(await getGuest(token))) return new Response("invalid token", { status: 403 });
  if (typeof name !== "string" || !name.trim() || name.length > 100) return new Response("invalid name", { status: 400 });
  if (typeof text !== "string" || !text.trim() || text.length > 1000) return new Response("invalid text", { status: 400 });
  try {
    const m = await addMessage({ token, name: name.trim(), text: text.trim() });
    return Response.json({ id: m.id }, { status: 201 });
  } catch (err) {
    if ((err as Error).message === "rate_limited") return new Response("too many messages", { status: 429 });
    return new Response("storage error, please retry", { status: 500 });
  }
}
```

- [ ] **Step 2: Message form component**

`src/app/i/[token]/sections/MessageForm.tsx`:

```tsx
"use client";
import { useState } from "react";

export default function MessageForm({ token, guestName }: { token: string; guestName: string }) {
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">("idle");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("saving");
    const f = new FormData(e.currentTarget);
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, name: f.get("name"), text: f.get("text") }),
    }).catch(() => null);
    setState(res?.ok ? "done" : "error");
  }
  if (state === "done") return <p>Thank you! Your message will appear after review.</p>;
  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
      <input name="name" defaultValue={guestName} required maxLength={100} placeholder="Your name" />
      <textarea name="text" required maxLength={1000} rows={4} placeholder="Write your wishes..." />
      <button disabled={state === "saving"}>{state === "saving" ? "Sending..." : "Send wishes"}</button>
      {state === "error" && <p role="alert">Could not send. Please try again.</p>}
    </form>
  );
}
```

- [ ] **Step 3: Render approved messages in page**

In `page.tsx`, add at top: `import { listMessages } from "@/lib/storage";` and inside the component: `const approved = await listMessages("approved");`. Replace the Task-6 placeholder with:

```tsx
<MessageForm token={token} guestName={guest} />
<ul className={styles.wall}>
  {approved.map((m) => (
    <li key={m.id}><strong>{m.name}</strong><p>{m.text}</p></li>
  ))}
</ul>
```

Add to `invitation.module.css`:

```css
.wall { list-style: none; padding: 0; margin-top: 24px; display: grid; gap: 16px; }
.wall li { background: #fff; border: 1px solid #e5ddd0; border-radius: 8px; padding: 16px; }
```

Ensure the page is rendered dynamically (not statically cached at build) so new approved messages appear — check the caching/rendering guide in `node_modules/next/dist/docs/` for the current way to force dynamic rendering, and apply it.

- [ ] **Step 4: Verify**

Submit a message in browser; check `data/messages.json` has it with `"status": "pending"` and the wall does NOT show it. Manually edit status to `"approved"`, reload, message appears.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: guest message wall with pending-by-default moderation"
```

---

### Task 7: Admin — login, moderation, RSVP list

**Files:**
- Create: `src/lib/admin-auth.ts`, `src/middleware.ts`, `src/app/admin/login/page.tsx`, `src/app/api/admin/login/route.ts`, `src/app/admin/page.tsx`, `src/app/api/admin/messages/route.ts`

**Interfaces:**
- Consumes: `listMessages`, `setMessageStatus`, `listRsvps`
- Produces:
  - `hashPassword(pw: string): string` (sha256 hex) in `admin-auth.ts`
  - Cookie `admin_session` = sha256 of `ADMIN_PASSWORD` env; middleware guards `/admin` (except `/admin/login`)
  - `POST /api/admin/login` `{ password }` → sets cookie, `204`; wrong → `401`
  - `POST /api/admin/messages` `{ id, status }` → `204`

**Check `node_modules/next/dist/docs/` middleware + cookies guides first — these APIs shift between versions.**

- [ ] **Step 1: Auth helper**

`src/lib/admin-auth.ts`:

```ts
import { createHash } from "node:crypto";

export function hashPassword(pw: string): string {
  return createHash("sha256").update(pw).digest("hex");
}

export function expectedSession(): string {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) throw new Error("ADMIN_PASSWORD not set");
  return hashPassword(pw);
}
```

`ponytail:` static hash cookie, no expiry/rotation. Single operator over HTTPS. Upgrade path: signed session with expiry.

- [ ] **Step 2: Middleware**

`src/middleware.ts` (adapt to installed version's middleware API):

```ts
import { NextResponse, type NextRequest } from "next/server";
import { expectedSession } from "@/lib/admin-auth";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith("/admin") || pathname.startsWith("/admin/login")) return NextResponse.next();
  if (req.cookies.get("admin_session")?.value === expectedSession()) return NextResponse.next();
  return NextResponse.redirect(new URL("/admin/login", req.url));
}

export const config = { matcher: ["/admin/:path*"] };
```

If the installed Next version's middleware runtime cannot use `node:crypto`, move the check into the admin page/layout as a server-side guard instead and delete the middleware — same behavior, different placement.

- [ ] **Step 3: Login page + API**

`src/app/admin/login/page.tsx`:

```tsx
"use client";
import { useState } from "react";

export default function AdminLogin() {
  const [err, setErr] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: f.get("password") }),
    });
    if (res.ok) window.location.href = "/admin";
    else setErr(true);
  }
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <form onSubmit={submit} style={{ display: "grid", gap: 12, width: 280 }}>
        <input name="password" type="password" placeholder="Admin password" required />
        <button>Login</button>
        {err && <p role="alert">Wrong password</p>}
      </form>
    </main>
  );
}
```

`src/app/api/admin/login/route.ts`:

```ts
import { expectedSession, hashPassword } from "@/lib/admin-auth";

export async function POST(req: Request) {
  const { password } = await req.json().catch(() => ({}));
  if (typeof password !== "string" || hashPassword(password) !== expectedSession())
    return new Response("unauthorized", { status: 401 });
  return new Response(null, {
    status: 204,
    headers: { "Set-Cookie": `admin_session=${expectedSession()}; HttpOnly; Path=/; SameSite=Lax; Secure` },
  });
}
```

Note: drop `Secure` in local dev if cookies don't stick over http — or set it conditionally on `process.env.NODE_ENV === "production"`.

- [ ] **Step 4: Admin page**

`src/app/admin/page.tsx` (server component; guard again server-side in case middleware was dropped):

```tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { expectedSession } from "@/lib/admin-auth";
import { listMessages, listRsvps } from "@/lib/storage";
import ModerateButtons from "./ModerateButtons";

export default async function AdminPage() {
  const c = await cookies();
  if (c.get("admin_session")?.value !== expectedSession()) redirect("/admin/login");
  const pending = await listMessages("pending");
  const rsvps = await listRsvps();
  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: 20 }}>
      <h1>Admin</h1>
      <h2>Pending messages ({pending.length})</h2>
      {pending.map((m) => (
        <div key={m.id} style={{ border: "1px solid #ccc", borderRadius: 8, padding: 12, marginBottom: 12 }}>
          <strong>{m.name}</strong>
          <p>{m.text}</p>
          <ModerateButtons id={m.id} />
        </div>
      ))}
      <h2>RSVPs ({rsvps.length})</h2>
      <table>
        <thead><tr><th>Name</th><th>Attending</th><th>Count</th><th>Note</th></tr></thead>
        <tbody>
          {rsvps.map((r) => (
            <tr key={r.token}><td>{r.name}</td><td>{r.attending ? "yes" : "no"}</td><td>{r.count}</td><td>{r.note}</td></tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
```

`src/app/admin/ModerateButtons.tsx`:

```tsx
"use client";

export default function ModerateButtons({ id }: { id: string }) {
  async function act(status: "approved" | "rejected") {
    await fetch("/api/admin/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    window.location.reload();
  }
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <button onClick={() => act("approved")}>Approve</button>
      <button onClick={() => act("rejected")}>Reject</button>
    </div>
  );
}
```

`src/app/api/admin/messages/route.ts`:

```ts
import { cookies } from "next/headers";
import { expectedSession } from "@/lib/admin-auth";
import { setMessageStatus } from "@/lib/storage";

export async function POST(req: Request) {
  const c = await cookies();
  if (c.get("admin_session")?.value !== expectedSession()) return new Response("unauthorized", { status: 401 });
  const { id, status } = await req.json().catch(() => ({}));
  if (typeof id !== "string" || (status !== "approved" && status !== "rejected"))
    return new Response("bad request", { status: 400 });
  await setMessageStatus(id, status);
  return new Response(null, { status: 204 });
}
```

- [ ] **Step 5: Verify**

Set `ADMIN_PASSWORD=test123` in `.env.local`. Restart dev server. `/admin` redirects to login; wrong password → error; correct → pending list. Approve the earlier message → appears on invitation wall. RSVP table shows entries.

- [ ] **Step 6: Run all tests**

Run: `node --test src/lib/` — Expected: all PASS. Also `npm run build` — Expected: success.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: admin login, message moderation, rsvp list"
```

---

### Task 8: Deploy docs + backup notes

**Files:**
- Create: `README.md` (replace scaffolded one), `.env.example`

**Interfaces:**
- Produces: documented deploy/run/backup procedure for the VPS

- [ ] **Step 1: `.env.example`**

```
ADMIN_PASSWORD=change-me
DATA_DIR=/var/lib/wedding-invitation
```

- [ ] **Step 2: README**

Replace `README.md` with:

```markdown
# Wedding Invitation

Self-hosted wedding invitation. Next.js, file-based JSON storage, per-guest token links.

## Dev

    cp data/guests.example.json data/guests.json
    echo "ADMIN_PASSWORD=test123" > .env.local
    npm install
    npm run dev

Open http://localhost:3000/i/abc123

## Deploy (VPS)

1. `npm ci && npm run build`
2. Set env: `ADMIN_PASSWORD`, `DATA_DIR=/var/lib/wedding-invitation` (dir must exist, writable by the app user, contains `guests.json`)
3. Run `npm start` under a process manager (systemd/pm2) behind your reverse proxy (nginx/caddy) with HTTPS on your domain
4. Guest links: `https://your-domain/i/<token>`
5. Admin: `https://your-domain/admin`

## Guests

`$DATA_DIR/guests.json`: `{ "token": "Display Name" }`. Generate tokens: `openssl rand -hex 8`.

## Backup

Copy `$DATA_DIR` (rsvps.json, messages.json, guests.json) off the VPS regularly:

    rsync -a vps:/var/lib/wedding-invitation/ ./backup/

## Tests

    node --test src/lib/
```

- [ ] **Step 3: Final check**

Run: `npm run build && node --test src/lib/` — Expected: both succeed.

- [ ] **Step 4: Commit and push**

```bash
git add -A && git commit -m "docs: deploy, guests, backup instructions"
git push
```

---

## Deferred (per spec / user request)

- Editorial/luxury visual design pass, 3D zoom scroll, parallax, interactive moments — separate design-detail session; content module and section components are the seams for it
- Love story and gift info sections
- Any animation library choice
