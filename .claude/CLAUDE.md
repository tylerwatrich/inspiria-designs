# 🧠 CLAUDE.md — Inspiria Designs AI Operating Manual

---

## ⚡ SESSION START — Do These 3 Things Before Anything Else

1. Read `.claude/STACK.md` → understand the project architecture and current versions
2. Read `.claude/SESSION.md` → know exactly where we left off and what's broken
3. Read `.claude/BRAIN.md` → load accumulated intelligence, risks, and prior agent thoughts
4. **Do not scan the workspace** if the answer is already in those files

---

## 🤖 Orchestration — When to Use Gemini (Decide Autonomously)

Claude manages Gemini via MCP (`gemini-cli`). Do not wait for the user to ask. Self-route based on these rules:

| Situation | Action |
|-----------|--------|
| Task touches more than 3 files | Delegate to Gemini |
| User describes a symptom without a known cause | Delegate to Gemini |
| Workspace-wide search needed (`grep`, `find`, directory scan) | Delegate to Gemini |
| A version or API exists that Claude doesn't recognize | Delegate to Gemini (web search) |
| User asks about current best practices for a fast-moving library | Delegate to Gemini (web search) |
| Fix is under 3 files and cause is already known | Claude handles directly |
| Updating .claude/SESSION.md or .claude/BRAIN.md | Claude handles directly |

### Handoff Workflow
```
User describes problem
  → Claude reads .claude/STACK.md + .claude/SESSION.md + .claude/BRAIN.md
  → If multi-file or unknown cause → Claude calls Gemini
      → Gemini returns: file paths, line numbers, bullet points (no prose)
      → Claude validates against .claude/STACK.md before trusting findings
  → Claude writes the fix
  → Claude updates .claude/SESSION.md
  → Claude appends observations, risks, and change summary to .claude/BRAIN.md
```

---

## 🗂️ Memory Files — What They Are and Who Owns Them

| File | Job | Written By | Read By |
|------|-----|------------|---------|
| `.claude/CLAUDE.md` | Operating manual | Human / Claude (on instruction) | Claude (auto) |
| `.claude/STACK.md` | Static project facts — versions, files, patterns | Gemini (after scans) | Both agents |
| `.claude/SESSION.md` | Live state — current task, last action, next step, blockers | Claude (after every change) | Both agents |
| `.claude/BRAIN.md` | Accumulated intelligence — thoughts, risks, change summaries, context for next session | Both agents (append-only) | Both agents |

SESSION.md tracks current state. BRAIN.md accumulates wisdom across sessions. Never delete BRAIN.md entries — cross them out if wrong, then add a correction below.

---

## 🐛 Bug Playbooks

### Admin UI List View is Empty
Before Claude writes a single line of code, Gemini audits in this order:
1. `.env` → `PAYLOAD_PUBLIC_SERVER_URL` set and matching the running port?
2. `src/collections/Posts.ts` → `access.read` — is it filtering out drafts or unauthenticated requests?
3. `payload.config.ts` → Posts collection registered? `admin.user` slug correct?
4. Database → rows actually exist? Run `test-fetch.ts` or query directly

**Silent killers:**
- `read: () => ({ _status: { equals: 'published' } })` → drafts invisible
- `PAYLOAD_PUBLIC_SERVER_URL` on wrong port → list silently returns `[]`
- `admin: { user: 'users' }` slug mismatch → Payload defaults to no access

### Neon DB Connectivity
- Match `DATABASE_URI` to the correct Neon branch (dev ≠ prod)
- Free tier pauses after inactivity — wake it before any test
- Vercel env vars must exactly match local `.env`

---

## 📦 Knowledge Cutoff Protocol

Claude's training has a cutoff. The current date is 2026. Framework versions may have moved significantly.

**Trigger Gemini web search when:**
- A version number is unfamiliar (e.g. Next.js 16.x, Payload 4.x)
- A package API doesn't match Claude's memory
- User mentions wanting to stay up to date
- A deprecation warning appears for something Claude considers current

**Never** guess at a version or reason from stale knowledge. Say: *"My training may not cover this version — delegating to Gemini for current docs."*

**User's version preference:** Latest stable unless a documented breaking issue exists. If a breaking issue exists, pin to latest stable minus one and explain why.

**Treat as potentially stale:**
- `next` — major versions ship regularly
- `@payloadcms/*` — breaking changes between minors
- `@neondatabase/serverless` — evolving adapter API

---

## 🏗️ Architectural Rules — Never Violate

- Access pattern: `authenticatedOrPublished` only
- App Router only — no Pages Router patterns
- Payload 3.0 — do not reference 2.x docs or APIs
- Postgres via Neon — no SQLite assumptions
- Deployed on Vercel — no persistent server assumptions
