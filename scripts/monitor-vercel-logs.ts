/**
 * monitor-vercel-logs.ts
 *
 * Monitors Vercel deployment logs post-deploy.
 * Fetches the latest deployment, streams its build events, then tails runtime logs.
 *
 * Required env vars:
 *   VERCEL_TOKEN       — Vercel API token (Settings → Tokens)
 *
 * Optional env vars:
 *   VERCEL_PROJECT_ID  — Narrows to a specific project (recommended)
 *   VERCEL_TEAM_ID     — Required if token belongs to a team scope
 *
 * Usage:
 *   tsx --env-file=.env scripts/monitor-vercel-logs.ts
 *   tsx --env-file=.env scripts/monitor-vercel-logs.ts --deployment <id-or-url>
 *   tsx --env-file=.env scripts/monitor-vercel-logs.ts --runtime-only
 */

import { parseArgs } from 'node:util'

// ─── Config ──────────────────────────────────────────────────────────────────

const TOKEN = process.env.VERCEL_TOKEN
const PROJECT_ID = process.env.VERCEL_PROJECT_ID
const TEAM_ID = process.env.VERCEL_TEAM_ID

if (!TOKEN) {
  console.error('ERROR: VERCEL_TOKEN is not set. Add it to your .env file.')
  process.exit(1)
}

const BASE = 'https://api.vercel.com'
const HEADERS = { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' }

// Append ?teamId=... when needed
function teamParam(sep: '?' | '&' = '?') {
  return TEAM_ID ? `${sep}teamId=${TEAM_ID}` : ''
}

// ─── CLI args ─────────────────────────────────────────────────────────────────

const { values: args } = parseArgs({
  options: {
    deployment: { type: 'string' },
    'runtime-only': { type: 'boolean', default: false },
    tail: { type: 'boolean', default: false, short: 't' },
    limit: { type: 'string', default: '200' },
  },
  strict: false,
})

// ─── Types ───────────────────────────────────────────────────────────────────

interface Deployment {
  uid: string
  url: string
  name: string
  state: string
  createdAt: number
  meta?: Record<string, string>
}

interface BuildEvent {
  type: string
  created: number
  payload?: {
    text?: string
    deploymentId?: string
    info?: { type?: string; name?: string }
    serial?: string
  }
}

interface LogEntry {
  id: string
  message: string
  timestamp: number
  type: 'stdout' | 'stderr'
  source: 'build' | 'lambda' | 'edge' | 'static' | 'external'
  deploymentId?: string
  requestId?: string
  statusCode?: number
  path?: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(ms: number) {
  return new Date(ms).toISOString().replace('T', ' ').replace('Z', ' UTC')
}

const RESET = '\x1b[0m'
const RED = '\x1b[31m'
const YELLOW = '\x1b[33m'
const GREEN = '\x1b[32m'
const CYAN = '\x1b[36m'
const DIM = '\x1b[2m'
const BOLD = '\x1b[1m'

function colorLine(line: string, source?: string, type?: string) {
  if (type === 'stderr' || /\b(error|Error|ERROR|failed|FAILED)\b/.test(line)) {
    return `${RED}${line}${RESET}`
  }
  if (/\b(warn|Warn|WARN|warning|Warning)\b/.test(line)) {
    return `${YELLOW}${line}${RESET}`
  }
  if (source === 'build' && /^\s*(✓|✔|done|compiled|ready)\b/i.test(line)) {
    return `${GREEN}${line}${RESET}`
  }
  if (source === 'build') return `${DIM}${line}${RESET}`
  return line
}

// ─── API calls ───────────────────────────────────────────────────────────────

async function getLatestDeployment(): Promise<Deployment> {
  let url = `${BASE}/v6/deployments?limit=1&sort=createdAt`
  if (PROJECT_ID) url += `&projectId=${PROJECT_ID}`
  if (TEAM_ID) url += `&teamId=${TEAM_ID}`

  const res = await fetch(url, { headers: HEADERS })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Failed to list deployments: ${res.status} ${body}`)
  }
  const data = (await res.json()) as { deployments: Deployment[] }
  if (!data.deployments?.length) {
    throw new Error('No deployments found. Check VERCEL_PROJECT_ID / VERCEL_TEAM_ID.')
  }
  return data.deployments[0]
}

async function getDeployment(idOrUrl: string): Promise<Deployment> {
  const url = `${BASE}/v13/deployments/${encodeURIComponent(idOrUrl)}${teamParam()}`
  const res = await fetch(url, { headers: HEADERS })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Failed to get deployment: ${res.status} ${body}`)
  }
  return res.json() as Promise<Deployment>
}

/** Stream build events via Server-Sent Events until the deployment reaches a terminal state. */
async function streamBuildEvents(deploymentId: string) {
  const sep = TEAM_ID ? '&' : '?'
  const url = `${BASE}/v3/deployments/${deploymentId}/events${teamParam()}${TEAM_ID ? '&' : '?'}direction=forward&follow=1`

  console.log(`\n${BOLD}${CYAN}── Build Logs ──────────────────────────────────────────────${RESET}`)

  const res = await fetch(url, { headers: { ...HEADERS, Accept: 'text/event-stream' } })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Failed to stream build events: ${res.status} ${body}`)
  }

  if (!res.body) {
    throw new Error('No response body from event stream')
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let errorCount = 0
  let warnCount = 0
  let done = false

  while (!done) {
    const { value, done: streamDone } = await reader.read()
    done = streamDone
    if (value) buffer += decoder.decode(value, { stream: true })

    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      if (!line.startsWith('data:')) continue
      const raw = line.slice(5).trim()
      if (!raw || raw === '[DONE]') continue

      let event: BuildEvent
      try {
        event = JSON.parse(raw)
      } catch {
        continue
      }

      const text = event.payload?.text ?? ''

      if (event.type === 'stdout' || event.type === 'stderr' || event.type === 'command') {
        if (!text.trim()) continue
        const colored = colorLine(text.trim(), 'build', event.type)
        console.log(`${DIM}[build]${RESET} ${colored}`)
        if (event.type === 'stderr' || /\berror\b/i.test(text)) errorCount++
        if (/\bwarn(ing)?\b/i.test(text)) warnCount++
      } else if (event.type === 'ready' || event.type === 'alias-assigned') {
        console.log(`\n${GREEN}✓ Deployment ready${RESET}`)
        done = true
      } else if (event.type === 'error') {
        console.log(`\n${RED}✗ Build failed: ${text}${RESET}`)
        errorCount++
        done = true
      }
    }
  }

  console.log(
    `\n${BOLD}Build summary:${RESET} ${errorCount > 0 ? RED : GREEN}${errorCount} error(s)${RESET}, ` +
      `${warnCount > 0 ? YELLOW : DIM}${warnCount} warning(s)${RESET}`,
  )

  return { errorCount, warnCount }
}

/** Fetch recent runtime function logs for a deployment. */
async function fetchRuntimeLogs(deploymentId: string, limit = 200) {
  let url = `${BASE}/v1/deployments/${deploymentId}/events?limit=${limit}&direction=backward`
  if (TEAM_ID) url += `&teamId=${TEAM_ID}`

  const res = await fetch(url, { headers: HEADERS })
  if (!res.ok) {
    // Runtime logs endpoint may not exist for all plan types
    if (res.status === 403 || res.status === 404) {
      console.log(`${YELLOW}Runtime logs unavailable for this deployment/plan tier.${RESET}`)
      return
    }
    const body = await res.text()
    throw new Error(`Failed to fetch runtime logs: ${res.status} ${body}`)
  }

  const data = (await res.json()) as LogEntry[]
  if (!Array.isArray(data) || data.length === 0) {
    console.log(`${DIM}No runtime logs found for this deployment.${RESET}`)
    return
  }

  console.log(
    `\n${BOLD}${CYAN}── Runtime Logs (${data.length}) ─────────────────────────────────${RESET}`,
  )

  // Sort oldest-first for reading
  const sorted = [...data].sort((a, b) => a.timestamp - b.timestamp)

  for (const entry of sorted) {
    const time = formatTime(entry.timestamp)
    const source = entry.source ?? 'fn'
    const msg = entry.message?.trim() ?? ''
    if (!msg) continue
    const colored = colorLine(msg, source, entry.type)
    const prefix = `${DIM}[${time}] [${source}]${RESET}`
    console.log(`${prefix} ${colored}`)
  }

  const errors = sorted.filter(
    (e) => e.type === 'stderr' || /\berror\b/i.test(e.message ?? ''),
  ).length
  const warns = sorted.filter((e) => /\bwarn(ing)?\b/i.test(e.message ?? '')).length

  console.log(
    `\n${BOLD}Runtime summary:${RESET} ${errors > 0 ? RED : GREEN}${errors} error(s)${RESET}, ` +
      `${warns > 0 ? YELLOW : DIM}${warns} warning(s)${RESET}`,
  )
}

/** Tail runtime logs — polls every few seconds for new entries. */
async function tailRuntimeLogs(deploymentId: string, intervalMs = 5000) {
  console.log(
    `\n${BOLD}${CYAN}── Tailing Runtime Logs (Ctrl+C to stop) ─────────────────────${RESET}`,
  )

  let since = Date.now() - 60_000 // Start from 1 minute ago
  const seen = new Set<string>()

  async function poll() {
    let url = `${BASE}/v1/deployments/${deploymentId}/events?limit=50&direction=forward&since=${since}`
    if (TEAM_ID) url += `&teamId=${TEAM_ID}`

    const res = await fetch(url, { headers: HEADERS })
    if (!res.ok) {
      if (res.status === 403 || res.status === 404) {
        console.log(`${YELLOW}Runtime logs unavailable — stopping tail.${RESET}`)
        process.exit(0)
      }
      return
    }

    const data = (await res.json()) as LogEntry[]
    if (!Array.isArray(data)) return

    const sorted = [...data].sort((a, b) => a.timestamp - b.timestamp)
    for (const entry of sorted) {
      if (seen.has(entry.id)) continue
      seen.add(entry.id)
      since = Math.max(since, entry.timestamp)

      const msg = entry.message?.trim() ?? ''
      if (!msg) continue
      const time = formatTime(entry.timestamp)
      const source = entry.source ?? 'fn'
      const colored = colorLine(msg, source, entry.type)
      console.log(`${DIM}[${time}] [${source}]${RESET} ${colored}`)
    }
  }

  // Run first poll immediately
  await poll()

  const interval = setInterval(async () => {
    try {
      await poll()
    } catch (err) {
      console.error(`${RED}Poll error: ${err}${RESET}`)
    }
  }, intervalMs)

  // Keep process alive; user kills with Ctrl+C
  process.on('SIGINT', () => {
    clearInterval(interval)
    console.log('\nStopped.')
    process.exit(0)
  })

  // Return a promise that never resolves so the script stays alive
  return new Promise<void>(() => {})
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const runtimeOnly = args['runtime-only'] as boolean
  const tailMode = args['tail'] as boolean
  const logLimit = parseInt(args['limit'] as string, 10)

  // Resolve which deployment to inspect
  let deployment: Deployment

  if (args['deployment']) {
    console.log(`${CYAN}Fetching deployment: ${args['deployment']}${RESET}`)
    deployment = await getDeployment(args['deployment'] as string)
  } else {
    console.log(`${CYAN}Fetching latest deployment${PROJECT_ID ? ` for project ${PROJECT_ID}` : ''}…${RESET}`)
    deployment = await getLatestDeployment()
  }

  const stateColor =
    deployment.state === 'READY'
      ? GREEN
      : deployment.state === 'ERROR'
        ? RED
        : deployment.state === 'BUILDING'
          ? YELLOW
          : DIM

  console.log(
    `\n${BOLD}Deployment:${RESET} ${deployment.uid}\n` +
      `${BOLD}URL:${RESET}       https://${deployment.url}\n` +
      `${BOLD}State:${RESET}     ${stateColor}${deployment.state}${RESET}\n` +
      `${BOLD}Created:${RESET}   ${formatTime(deployment.createdAt)}`,
  )

  // ── Build logs ──
  if (!runtimeOnly) {
    if (deployment.state === 'BUILDING') {
      // Stream live build logs
      await streamBuildEvents(deployment.uid)
    } else if (deployment.state === 'ERROR') {
      console.log(`\n${RED}Deployment failed — fetching build events for error details…${RESET}`)
      await streamBuildEvents(deployment.uid)
    } else {
      console.log(`\n${DIM}Deployment already in ${deployment.state} state — skipping build log stream.${RESET}`)
    }
  }

  // ── Runtime logs ──
  if (tailMode) {
    await tailRuntimeLogs(deployment.uid)
  } else {
    await fetchRuntimeLogs(deployment.uid, logLimit)
  }
}

main().catch((err) => {
  console.error(`${RED}Fatal: ${err instanceof Error ? err.message : err}${RESET}`)
  process.exit(1)
})
