# 🧠 CLAUDE.md — Inspiria Designs AI Operating Manual

---

## ⚡ SESSION START — Do These 4 Things Before Anything Else

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
PHASE 1 — PREFLIGHT
  Claude reads memory files
  Claude states: task + assumptions + hypothesis + expected outcome
  Claude sends instructions to Gemini

  Gemini validates Claude's instructions BEFORE acting:
    - Are Claude's assumptions current and accurate?
    - Are there newer APIs, versions, or patterns Claude may not know about?
    - Is Claude's approach the right one for this stack?
  Gemini reports back: "Assumptions valid" OR "Correction needed: [what's wrong]"

  Claude reviews Gemini's validation
    - If correction is minor → Claude adjusts and confirms
    - If correction changes the approach → Claude revises instructions before proceeding
    - Claude must explicitly confirm before Gemini acts

PHASE 2 — EXECUTION
  Gemini performs the action
  Gemini self-validates results against Claude's stated criteria
  Gemini returns:
    - Raw data (file:line references, no prose)
    - Summary (what was found, confidence level)
    - Flag: Simple fix / Complex fix

PHASE 3 — DECISION
  Claude reads summary first, raw data only if something seems off
  Claude checks findings against its original hypothesis
  Claude decides: implement / push back / request clarification

  If pushing back → Claude sends a narrower, more precise follow-up to Gemini
  Loop returns to Phase 2 with the new query
```

### Back-and-Forth Limits

Complexity is determined by Claude after Phase 2 returns. Claude must declare complexity before the loop begins.

| Complexity | Definition | Max Rounds |
|------------|------------|------------|
| Simple | Single cause, under 3 files, known pattern | 1-2 rounds — implement fast, don't over-verify |
| Complex | Multi-file, unknown cause, architectural impact | Hard cap of 10 rounds |

**At round 10 on a complex task:** Claude stops the loop, summarizes what's known and unknown, and asks the user for a decision rather than continuing to iterate. Do not exceed 10 rounds under any circumstances.

**Simple task rule:** If Claude identifies a task as simple, skip the extended validation loop entirely. State the fix, confirm with one Gemini check if needed, implement. Unnecessary back-and-forth on simple tasks is its own failure mode.

### Gemini Task Size Rules — Critical

Gemini has an internal execution time limit. Large tasks time out and fail silently. Claude must decompose every Gemini request into small, targeted calls.

**One call = one concern. Never bundle multiple questions into a single Gemini call.**

| ❌ Too broad — will timeout | ✅ Correct — targeted |
|---------------------------|----------------------|
| "Scan the entire workspace for access control issues" | "Read `src/collections/Posts.ts` and return the `access.read` function" |
| "Audit all collections and find any misconfigurations" | "List all files in `src/collections/`" then one call per file |
| "Check .env, Posts.ts, and payload.config.ts for the empty list bug" | Three separate calls, one per file |

**Rules:**
- One file or one directory per call — never both
- One question per call — never ask Gemini to find AND validate in the same call
- If a task requires scanning more than one directory, chain calls sequentially
- If Gemini is taking more than ~20 seconds, the task is too broad — cancel and split it

**When Gemini fails:** Log it immediately in the Gemini Error Log in SESSION.md before doing anything else. Then retry with a smaller scoped call.

### What Claude Must Never Do
- Accept Gemini's findings without checking them against the hypothesis
- Accept Gemini's validation of Claude's own instructions without confirming it makes sense
- Continue a loop past round 10
- Treat a simple fix as complex to be thorough — bias toward action on simple tasks
- Send Gemini a broad multi-file scan in a single call
- Wait indefinitely for Gemini — if no response after ~20 seconds, surface the issue to the user

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