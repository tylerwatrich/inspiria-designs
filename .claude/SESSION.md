# 🎯 SESSION.md — Live Project State
*Updated by Claude after every significant action*

---

## Current Objective

**What we're trying to do:**
User tracking system implemented — every site visitor is recorded in a `PageViews` Payload collection with their IP address, location (country/city/region from Vercel edge headers), and a full log of every page they visit.
Neon production DB reset to match local — 38 clean published posts, correct schema with FAQs and key takeaways, no duplicates.

**Why it matters:**
First-party analytics stored directly in the CMS — no third-party dependency for visitor data.
Neon had 74 posts with duplicates and stale data. Local is the source of truth.

---

## Current State

**Stage:** Implementation complete — needs `pnpm dev` to auto-migrate the new `page_views` table
**Status:** 🟡 Ready to test
**Stage:** Complete — Neon reset, Vercel redeploy triggered (branch: key-takeaways-and-faq)
**Status:** 🟢 Done

**Blocker:** None — tracking failures are silently caught and never break the site.
**Blocker:** None

**Next Action:**
1. Start dev server (`pnpm dev`) — Payload will auto-migrate the new `page-views` table
2. Run `pnpm payload generate:types` to update `payload-types.ts`
3. Visit any page → check `/admin/collections/page-views` for the record
4. Note: IP geolocation headers (`x-vercel-ip-*`) only populate on Vercel — local dev will show blank country/city
- Monitor Vercel deploy for successful build
- Verify production site shows correct post count
- Note: Vercel's `DATABASE_URI` env var must point to Neon (not localhost) — confirm in Vercel dashboard if prod still behaves oddly

---

## What We Know So Far

- Admin Posts list: **Fixed** — root cause was `slugField()` row wrapper causing Payload to save all columns as `active: false` to `payload_preferences` DB table
- DB: **31 posts confirmed**, all `_status: published`, IDs 289–324
- Active DB (dev): local PostgreSQL — `postgresql://tylerwatrich@localhost:5432/inspiria-designs`
- Stack confirmed: **Next.js 15.2.3, Payload 3.63.0**
- Commit: `6cfab19` — "Fix Payload admin blank columns and clean up AI slop"
- `.vscode/settings.json` contains Neon DB credentials — **not committed, gitignored**
- ⚠️ Neon password `npg_GNUqrPfo89Dx` was visible in `git diff` output during session — **consider rotating**

---

## What We've Already Ruled Out

- Empty admin list bug — **resolved** (slugField row wrapper + corrupted payload_preferences row)

---

## Last Action

> 2026-03-16 — Added Trade Compass search query logging. New `SearchLogs` Payload collection (industry, province, hideUS, timestamps). New `/api/search-logs` POST route. `handleFind` in TradeCompass fires a non-blocking fetch on every search. Logging failure is silently caught. Collection grouped under "Analytics" in admin sidebar. Needs `pnpm dev` to auto-migrate the new `search_logs` table.
> 2026-03-16 — Added `PageViews` collection and user tracking system. 4 files created/modified: `src/collections/PageViews.ts` (collection), `src/app/api/track/route.ts` (upsert endpoint), `src/components/PageTracker/index.tsx` (client component), registered in `payload.config.ts`, added to `(frontend)/layout.tsx`. Tracks: visitorId (localStorage UUID), IP, country/city/region (Vercel edge headers), pageCount, full pages array with path/title/timestamp. Needs `pnpm dev` to auto-migrate.

---

## 🔴 Gemini Error Log
*Claude logs every Gemini failure here automatically. Do not skip this step.*

| # | Date & Time | Task Given to Gemini | How Far It Got | Time Elapsed | Error Type |
|---|-------------|---------------------|----------------|--------------|------------|
| — | — | — | — | — | — |

**Error Types:**
- `TIMEOUT` — ran too long, hit execution time limit
- `AUTH` — authentication or credential failure
- `CONNECT` — MCP connection dropped
- `UNKNOWN` — no clear error returned

**How Claude should log:**
After any Gemini failure, immediately add a row before doing anything else. Estimate time elapsed if not exact. Note how far Gemini got — "started scan, reached src/collections before failing" is more useful than "failed."

---

## How Claude Should Update This File

After every meaningful action, rewrite the relevant sections above. Keep it current — this file is the single source of truth for project state.

Then append a one-liner to the history below:

---

## History

| Date | Agent | Action | Outcome |
|------|-------|--------|---------|
| 2026-03-10 | Gemini → Claude | Initial orchestration system designed | CLAUDE.md, STACK.md, SESSION.md, BRAIN.md created |
| 2026-03-11 | Claude + Gemini | Debug empty admin posts list | Root cause found and fixed — commit 6cfab19 |
| 2026-03-14 | Claude | Create TargetAudience collection | 2 files changed — needs pnpm dev to auto-migrate |
| 2026-03-15 | Claude | Implement email lead capture modal | 6 files changed, resend@6.9.3 installed — needs env vars + pnpm dev to verify |
| 2026-03-16 | Claude | Add Trade Compass search query logging | 4 files changed — needs pnpm dev to auto-migrate search_logs table |
| 2026-03-16 | Claude | Implement user/page tracking system | PageViews collection + /api/track + PageTracker component — needs pnpm dev to migrate |
| 2026-03-16 | Claude | Reset Neon prod DB from local | Wiped Neon (74 posts), restored local dump (38 clean posts), all migrations intact, Vercel redeploy triggered |
