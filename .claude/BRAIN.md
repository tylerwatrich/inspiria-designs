# 🧠 BRAIN.md — Accumulated Project Intelligence
*Written by AI agents. Append-only. Never delete entries — cross them out if invalidated.*
*Both Claude and Gemini should write here. Claude writes after decisions. Gemini writes after scans.*

---

## How to Use This File

**If you're an AI starting a new session:** Read the most recent entries in each section first. Older entries give history; newer entries give truth.

**If you're an AI finishing a task:** Add to the relevant sections below before closing. Keep entries short — 2-3 sentences max. Timestamp everything.

**If an older entry turns out to be wrong:** Do not delete it. Add a new entry below it marked `[SUPERSEDED]` explaining what actually turned out to be true.

---

## 💡 Observations & Insights

*Patterns, hunches, things that seem off, architectural notes that don't fit anywhere else.*

**[2026-03-10] — Claude**
The empty admin list bug is almost certainly one of three things: a `PAYLOAD_PUBLIC_SERVER_URL` port mismatch causing Payload's internal fetch to silently return `[]`, an `access.read` filter that's too aggressive (blocking authenticated users alongside public ones), or the database simply having no rows yet. These three causes look identical from the UI — the list is just empty with no error. The only way to differentiate them is to check the DB directly first. Don't skip this step.

**[2026-03-10] — Claude**
This project has a structural fragility worth watching: the AI content generation pipeline feeds into Payload, which feeds into the admin UI, which is the only visual confirmation anything is working. If any link in that chain breaks silently (Neon pauses, access control filters everything, wrong env vars), there's no error — just emptiness. Consider adding a simple `/api/health` route early that returns row counts and env var confirmation. Would save a lot of debugging time.

---

## ⚠️ Potential Issues & Risks

*Things that haven't broken yet but might. Flag them here so they're not a surprise.*

**[2026-03-10] — Claude**
Neon's free tier pauses after inactivity. If the AI content pipeline runs on a schedule but the DB is asleep, the insert will fail silently or throw a connection timeout. This will look like the AI pipeline isn't working when really the DB just needs a warm-up request first. Worth adding a DB ping before any scheduled write.

**[2026-03-10] — Claude**
Vercel's serverless environment means no persistent connections. The `@neondatabase/serverless` adapter handles this, but if the adapter version in `package.json` has drifted from what Claude knows, connection pooling behaviour may have changed. Have Gemini confirm the adapter version and current recommended config before assuming anything about how connections are managed.

**[2026-03-10] — Claude**
The `authenticatedOrPublished` access pattern is correct in principle, but it's easy to introduce a regression when editing `access.read`. A future change to add role-based access (e.g. editors vs admins) could accidentally re-introduce the "authenticated users see nothing" bug. Consider adding a comment block above the access function in Posts.ts explaining the pattern and the failure mode, so future edits are made carefully.

**[2026-03-10] — Claude**
Claude's knowledge of Next.js and Payload versions may be stale as of 2026. Any time a version number appears in `package.json` that doesn't match Claude's memory, treat that as a knowledge gap — not a user error. Delegate version-specific questions to Gemini immediately rather than reasoning from potentially outdated docs.

---

## 🔧 Changes Made

*Summarized log of what was actually changed and why. Not a git log — explain the reasoning.*

**[2026-03-10] — Claude**
Created the AI orchestration system (CLAUDE.md, STACK.md, SESSION.md, BRAIN.md). The previous setup had two files (ACTIVE_TASK.md, AGENT_LOG.md) doing overlapping jobs, which creates stale state risk. Consolidated into: CLAUDE.md (rules), STACK.md (static facts), SESSION.md (live state), BRAIN.md (this file — accumulated intelligence). The key change is that Claude now self-routes to Gemini based on explicit rules rather than waiting for the user to specify.

---

## 🗺️ Context for Next Task

*What the next agent session needs to know immediately to not waste time re-discovering things.*

**[2026-03-10] — Claude**
The active blocker is unconfirmed DB state. Before doing anything else: run `test-fetch.ts` and confirm whether rows exist in Neon. If rows exist → the bug is access control or env vars. If no rows exist → the bug is data seeding or the AI pipeline hasn't run yet. Everything else flows from this one check.

**[2026-03-10] — Claude**
Do not assume `.env` is correct. `PAYLOAD_PUBLIC_SERVER_URL` has not been verified this session. Check it early — a wrong port causes the admin list to silently return empty and wastes significant debugging time chasing phantom access control bugs.

---

## 🧩 Decisions Made & Why

*When a fork-in-the-road decision was made, record what was chosen and what was ruled out.*

**[2026-03-10] — Claude**
Chose `authenticatedOrPublished` as the access pattern (vs. a role-based system or fully public access). Rationale: the site needs public readers to see published posts without logging in, and the admin needs to see everything. A role-based system is overkill at this stage and adds complexity to a part of the code that's already causing bugs.

**[2026-03-10] — Claude**
Chose Neon (serverless Postgres) over a traditional Postgres instance. Rationale: Vercel deployment requires a serverless-compatible DB. Tradeoff is the cold-start/pause behaviour on the free tier, which needs to be accounted for in any scheduled pipeline logic.

