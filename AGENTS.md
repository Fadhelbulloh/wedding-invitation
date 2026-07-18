<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# wedding-invitation

Self-hosted single-couple wedding invitation site. Guests open a per-token link
(`/i/<token>`) that greets them by name, shows event/countdown/gallery/location,
and lets them RSVP and leave a moderated message. An operator moderates messages
and reviews RSVPs at `/admin`.

**Stack:** Next.js 16 (App Router, Turbopack) · React 19 · TypeScript (strict) ·
file-based JSON storage in `$DATA_DIR` · Node's built-in test runner. No database,
no external services (only a Google Maps `<iframe>` embed). Deploys as `npm start`
on a VPS behind a reverse proxy.

Detailed architecture, data model, and patterns live in `.ai-context/` — start at
`.ai-context/architecture/INDEX.md`.

## Coding rules for THIS repo

- **Route guard is `src/proxy.ts`, not `middleware.ts`.** Next.js 16 renamed the
  middleware convention to Proxy; there is exactly one proxy file per project.
- **All persistent state goes through `src/lib/storage.ts`.** Never read/write the
  JSON files directly from routes. Mutations must run inside `withLock` and use the
  temp-file + atomic-rename `writeJson` helper — the store is a single-process,
  whole-file rewrite (`ponytail:` comments mark the SQLite upgrade path).
- **Resolve the data directory at call time** via `process.env.DATA_DIR ?? ./data`
  inside a function, never as a module-level constant — tests swap `DATA_DIR`
  between cases (see `src/lib/storage.test.ts`).
- **Every guest-facing API validates the token first** with `getGuest(token)` and
  returns 403 on an unknown token; then validate field types and length bounds
  before touching storage (see `src/app/api/rsvp/route.ts`).
- **Invitation copy lives in `src/content/invitation.ts`** — one typed object, no
  hardcoded couple/venue/date strings in components.
- **Tests are `node:test` colocated as `src/lib/*.test.ts`.** No test framework or
  mocks; isolate state with `mkdtemp` + a `DATA_DIR` swap. Run `make test`; run
  `make lint` (tsc --noEmit + tests) before considering a change done.
