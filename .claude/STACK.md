# 📦 STACK.md — Project Architecture Reference
*Maintained by: Gemini (update after any architectural discovery)*
*Last updated: 2026-03-10*

---

## Project

**Name:** Inspiria Designs — Canadian Business News Site
**Purpose:** Auto-generate Canadian business news via AI APIs as a lead-generation funnel for web design clients
**Business Goal:** Drive traffic → capture leads → convert to web design clients

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Next.js **15.2.3** (App Router) | Confirmed 2026-03-11 |
| CMS | Payload **3.63.0** | Postgres adapter — NOT the MongoDB version |
| Database | Neon (Postgres, serverless) | Free tier pauses on inactivity |
| Database (dev) | Local PostgreSQL | `postgresql://tylerwatrich@localhost:5432/inspiria-designs` |
| Hosting | Vercel | Serverless — no persistent Node process |
| Language | TypeScript | `jsx: preserve` in tsconfig (Next.js handles transform) |
| AI Content | External AI APIs | Auto-generates news posts |

> ⚠️ **Version Warning:** Claude's training cutoff may predate current versions of Next.js and Payload. If versions in `package.json` are unfamiliar, have Gemini confirm current docs before writing code.

---

## Key Files

| File | Purpose |
|------|---------|
| `src/collections/Posts/index.ts` | Core Posts collection — access control, fields, hooks |
| `src/collections/Posts/hooks/populateAuthors.ts` | After-read hook that populates author name/id |
| `src/plugins/index.ts` | Plugin config — seoPlugin scoped to `['pages']` only |
| `payload.config.ts` | Main Payload config — collections registered here, admin user set here |
| `.env` | `PAYLOAD_PUBLIC_SERVER_URL`, `DATABASE_URI` — both critical |
| `test-fetch.ts` | Manual DB row verification script |

---

## Access Control Pattern

**Pattern name:** `authenticatedOrPublished`
**Rule:** Authenticated admin users see all posts. Public requests only see published posts.
**Where it lives:** `access.read` in `src/collections/Posts.ts`

```ts
// Correct pattern — do not deviate from this
read: ({ req: { user } }) => {
  if (user) return true
  return { _status: { equals: 'published' } }
}
```

**Common mistake:** Accidentally applying the published filter to authenticated users too, making the admin list appear empty.

---

## Environment Variables (Required)

| Variable | What it does | Common mistake |
|----------|-------------|----------------|
| `PAYLOAD_PUBLIC_SERVER_URL` | Internal fetch base URL for Payload | Wrong port — causes silent empty list |
| `DATABASE_URI` | Neon Postgres connection string | Dev vs prod branch mismatch |

---

## Known Issues & Resolved Bugs

| Date | Issue | Resolution | Status |
|------|-------|-----------|--------|
| 2026-03-11 | Admin list view empty | `slugField()` row wrapper → replaced with inline slug field; deleted corrupted `payload_preferences` row | ✅ Resolved |
| 2026-03-11 | `populateAuthors` only setting last author | Moved `populatedAuthors` assignment outside try block | ✅ Resolved |
| 2026-03-11 | `url` field afterRead hook using wrong param | `data` → `originalDoc` (correct Payload 3.0 API) | ✅ Resolved |
| — | Vercel + Neon connectivity | Not yet tested | 🔴 Open |

---

## Gemini Update Instructions

When updating this file after a scan:
- Update the versions table if `package.json` shows newer versions
- Add newly discovered key files to the Key Files table
- Add resolved bugs to the Known Issues table
- Do not remove historical entries — mark them Resolved instead
