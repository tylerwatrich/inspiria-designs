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
| Framework | Next.js 15 (App Router) | Confirm current version in package.json — may be 16.x |
| CMS | Payload 3.0 | Postgres adapter — NOT the MongoDB version |
| Database | Neon (Postgres, serverless) | Free tier pauses on inactivity |
| Hosting | Vercel | Serverless — no persistent Node process |
| Language | TypeScript | Strict mode assumed |
| AI Content | External AI APIs | Auto-generates news posts |

> ⚠️ **Version Warning:** Claude's training cutoff may predate current versions of Next.js and Payload. If versions in `package.json` are unfamiliar, have Gemini confirm current docs before writing code.

---

## Key Files

| File | Purpose |
|------|---------|
| `src/collections/Posts.ts` | Core Posts collection — access control, fields, hooks |
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
| 2026-03-10 | Admin list view empty | Auditing in progress — see SESSION.md | 🔴 Open |
| — | Vercel + Neon connectivity | Not yet resolved | 🔴 Open |

---

## Gemini Update Instructions

When updating this file after a scan:
- Update the versions table if `package.json` shows newer versions
- Add newly discovered key files to the Key Files table
- Add resolved bugs to the Known Issues table
- Do not remove historical entries — mark them Resolved instead
