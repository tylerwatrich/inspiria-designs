/**
 * Research helper — web search via Claude (default) or Gemini (opt-in).
 * Provider is selected at runtime via the automation-settings global.
 * Used for: news scanning, priority re-scoring, fact verification.
 */

import { getPayload } from 'payload'
import config from '@payload-config'

// ─── Provider detection ────────────────────────────────────────────────────────

async function getResearchProvider(): Promise<'claude' | 'gemini'> {
  try {
    const payload = await getPayload({ config })
    const settings = await payload.findGlobal({ slug: 'automation-settings' })
    const provider = (settings as any).researchProvider
    if (provider === 'gemini' && process.env.GEMINI_API_KEY) return 'gemini'
    return 'claude'
  } catch {
    return 'claude'
  }
}

// ─── Claude web search ─────────────────────────────────────────────────────────

async function callClaude(prompt: string, systemPrompt?: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set')

  const messages: { role: string; content: string }[] = [
    { role: 'user', content: prompt },
  ]

  const body: Record<string, unknown> = {
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 8192,
    tools: [{ type: 'web_search_20250305', name: 'web_search' }],
    messages,
  }

  if (systemPrompt) {
    body.system = systemPrompt
  }

  const doFetch = () =>
    fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'web-search-2025-03-05',
      },
      body: JSON.stringify(body),
    })

  let res = await doFetch()

  // On 429 wait 65s for the rate-limit window to roll over, then retry once
  if (res.status === 429) {
    console.warn('[callClaude] 429 rate limit hit — waiting 65s before retry')
    await new Promise((resolve) => setTimeout(resolve, 65_000))
    res = await doFetch()
  }

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Claude API error ${res.status}: ${err}`)
  }

  const data = await res.json()

  // Extract the last text block from the response content array
  const textBlocks = (data.content ?? []).filter((c: any) => c.type === 'text')
  return textBlocks[textBlocks.length - 1]?.text ?? ''
}

// ─── Gemini web search ─────────────────────────────────────────────────────────

const GEMINI_MODEL = 'gemini-2.0-flash'
const GEMINI_BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

async function callGemini(prompt: string, systemPrompt?: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set')

  const body: Record<string, unknown> = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    tools: [{ google_search: {} }],
    generationConfig: { temperature: 0.3 },
  }

  if (systemPrompt) {
    body.system_instruction = { parts: [{ text: systemPrompt }] }
  }

  const res = await fetch(`${GEMINI_BASE_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Gemini API error ${res.status}: ${err}`)
  }

  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
}

// ─── Unified call dispatcher ───────────────────────────────────────────────────

async function callResearch(prompt: string, systemPrompt?: string): Promise<string> {
  const provider = await getResearchProvider()
  if (provider === 'gemini') {
    return callGemini(prompt, systemPrompt)
  }
  return callClaude(prompt, systemPrompt)
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type ArticleArea = 'canadian-business-news' | 'industry-insights' | 'resources'

export type GeminiSuggestion = {
  headline: string
  summary: string
  keyPoints: string[]
  sources: { url: string; title: string }[]
  geminiContext: string
  area: ArticleArea
  vertical:
    | 'nuclear'
    | 'ai-cloud'
    | 'construction-tech'
    | 'finance'
    | 'trade'
    | 'deep-tech'
    | 'legal'
    | 'contractors'
    | 'real-estate'
    | 'procurement'
    | 'website-basics'
    | 'seo'
    | 'ecommerce'
  priority: number
  priorityReason: string
  smbRelevance: number
}

export type RePrioritized = {
  id: string
  newPriority: number
  newReason: string
  markStale: boolean
}

export type FactCheckResult = {
  verified: boolean
  corrections: string[]
  additionalContext: string
  updatedKeyPoints: string[]
}

// ─── Area scan configs ────────────────────────────────────────────────────────

type AreaConfig = {
  system: string
  prompt: (recentlyCoveredBlock: string) => string
}

const AREA_CONFIGS: Record<ArticleArea, AreaConfig> = {
  'canadian-business-news': {
    system: `You are a research analyst for Inspiria Digital, a Canadian business news publication.
Your job is to find real, current news stories that matter to Canadian small business owners — people running businesses with 1–50 employees who need to understand what news means for their operations, costs, and opportunities.
You MUST respond with valid JSON only. No preamble, no markdown fences.`,
    prompt: (recentlyCoveredBlock) => `${recentlyCoveredBlock}Search the web right now for the most significant Canadian business and technology news from the past 6 hours, with a focus on impact for Canadian small business owners.

Cover these topic areas:
- Bank of Canada rate decisions and lending conditions for small businesses
- CRA, GST/HST, and tax policy changes affecting small businesses
- Federal/provincial grants, loans, and programs (BDC, CEBA successor programs, CDAP)
- Labour law, minimum wage, and hiring conditions in Canada
- E-commerce, digital payments, and small business tech adoption
- Buy Canadian / procurement opportunities for small suppliers
- US tariffs and trade policy impact on Canadian SMBs
- Canadian nuclear energy and SMR development
- AI infrastructure and cloud computing in Canada
- Construction technology and proptech in Canada
- Canadian financial markets, fintech, banking
- Deep tech: quantum computing, biotech, space, semiconductors in Canada

Find 4 distinct stories. For each, assign:

Priority score (1–100):
- 80-100: Breaking news, major announcements, market-moving events
- 60-79: Significant developments worth covering within 24hrs
- 40-59: Solid evergreen angle on a current trend
- 1-39: Background/context piece, low urgency

SMB relevance score (1–10) — how directly does this story affect a Canadian small business owner's day-to-day operations or decisions:
- 9–10: Directly affects most small businesses (rate change, tax rule, major grant program)
- 7–8: Affects a significant subset (new procurement rules, sector-specific regulation)
- 5–6: Useful context/opportunity awareness (tech trend, market shift)
- 1–4: Mostly executive/investor interest, limited SMB applicability

Return a JSON array of story objects:
[
  {
    "headline": "Specific, compelling headline (max 12 words)",
    "summary": "2-3 sentence description of what's happening and why it matters to Canadian small business owners",
    "keyPoints": ["Specific fact 1", "Specific fact 2", "Specific fact 3"],
    "sources": [{"url": "actual URL", "title": "page title"}],
    "geminiContext": "3-4 sentences: key facts, numbers, and context a writer needs. No preamble.",
    "area": "canadian-business-news",
    "vertical": "one of: nuclear | ai-cloud | construction-tech | finance | trade | deep-tech",
    "priority": 75,
    "priorityReason": "Why this score — how significant is this story and why now?",
    "smbRelevance": 8
  }
]

Only include stories with actual sources you found. Do not fabricate.`,
  },

  'industry-insights': {
    system: `You are a market research analyst for Inspiria Digital, a Canadian web design agency.
Your job is to find news, trends, and developments directly relevant to contractors/trades, law firms, real estate professionals, and government procurement specialists in Canada.
Focus on what drives these businesses to reconsider their digital presence — operational challenges, regulatory changes, digital adoption pressures, competitive shifts, and client acquisition.
You MUST respond with valid JSON only. No preamble, no markdown fences.`,
    prompt: (recentlyCoveredBlock) => `${recentlyCoveredBlock}Search the web for recent news and trends (past 7 days) relevant to these Canadian industry sectors: contractors and trades, law firms, real estate professionals, and government procurement specialists.

Cover these topic areas:
- Regulatory changes affecting contractors, lawyers, realtors, or procurement officers in Canada
- Digital adoption pressures: new platforms, tools, or competitor moves forcing industry players online
- Client acquisition shifts: how these industries find new clients and how that's changing
- Legal tech and practice management software trends for Canadian law firms
- Contractor bidding platforms, estimating software, and project management tools in Canada
- PropTech, MLS changes, and digital marketing for Canadian real estate
- Government e-procurement platforms, MERX, and supplier portal changes in Canada
- Any story where digital presence (website, online reputation, online portals) is a competitive factor

Find 3 distinct stories across these industries. Prefer stories with strong buying intent signal — what would make a business owner in this sector reconsider their digital presence?

Priority score (1–100):
- 80-100: Regulatory mandate or major platform shift requiring immediate action
- 60-79: Clear competitive pressure or significant industry adoption trend
- 40-59: Emerging trend worth covering soon
- 1-39: Background context, low urgency

SMB relevance score (1–10) — how directly does this story affect a Canadian business in one of these sectors:
- 9–10: Direct operational or compliance impact
- 7–8: Affects client acquisition or competitive position meaningfully
- 5–6: Useful awareness, indirect impact
- 1–4: Mostly large enterprise or investor interest

Return a JSON array:
[
  {
    "headline": "Specific headline (max 12 words)",
    "summary": "2-3 sentence description of what's happening and why it matters for digital presence decisions",
    "keyPoints": ["Specific fact 1", "Specific fact 2", "Specific fact 3"],
    "sources": [{"url": "actual URL", "title": "page title"}],
    "geminiContext": "3-4 sentences: key facts, numbers, and context a writer needs. No preamble.",
    "area": "industry-insights",
    "vertical": "one of: legal | contractors | real-estate | procurement",
    "priority": 65,
    "priorityReason": "Why this score — what's the buying intent signal?",
    "smbRelevance": 8
  }
]

Only include stories with actual sources you found. Do not fabricate.`,
  },

  resources: {
    system: `You are a digital marketing research analyst for Inspiria Digital, a Canadian web design agency.
Your job is to find recent articles, studies, platform announcements, and best practice guides about web design, SEO, digital marketing, and small business technology.
Focus on content that a Canadian small business owner would find useful when evaluating or improving their online presence.
You MUST respond with valid JSON only. No preamble, no markdown fences.`,
    prompt: (recentlyCoveredBlock) => `${recentlyCoveredBlock}Search the web for recent (past 2 weeks) articles, studies, or announcements about web design, SEO, and digital marketing relevant to Canadian small businesses.

Cover these topic areas:
- Google algorithm updates and their impact on small business websites
- Web design trends: what's working for conversion, UX, mobile performance
- Local SEO changes and best practices for Canadian small businesses
- Small business e-commerce: platforms, checkout UX, customer acquisition
- Social media changes affecting B2B or local business marketing
- Website performance and Core Web Vitals updates
- Digital marketing ROI studies or benchmarks for SMBs
- Accessibility and compliance requirements for Canadian business websites
- AI tools for small business website content and marketing

Find 3 distinct topics. These should be educational and evergreen-leaning — prioritize quality and practical usefulness over breaking urgency.

Priority score (1–100):
- 60-79: Recent study or platform change with direct small business impact
- 40-59: Solid evergreen angle on a current trend (this is the sweet spot for Resources)
- 1-39: Very generic or widely covered already

SMB relevance score (1–10):
- 9–10: Every Canadian small business with a website needs to know this
- 7–8: Affects a significant number of small businesses
- 5–6: Useful for businesses actively investing in digital
- 1–4: Too technical or too enterprise-focused

Return a JSON array:
[
  {
    "headline": "Specific, useful headline (max 12 words)",
    "summary": "2-3 sentence description of what this covers and why a small business owner should care",
    "keyPoints": ["Practical insight 1", "Practical insight 2", "Practical insight 3"],
    "sources": [{"url": "actual URL", "title": "page title"}],
    "geminiContext": "3-4 sentences: key facts, numbers, and context a writer needs. No preamble.",
    "area": "resources",
    "vertical": "one of: website-basics | seo | ecommerce",
    "priority": 50,
    "priorityReason": "Why this score — what makes this worth writing now?",
    "smbRelevance": 7
  }
]

Only include topics with actual sources you found. Do not fabricate.`,
  },
}

// ─── Scan for news ────────────────────────────────────────────────────────────

/**
 * Salvage complete JSON objects from a potentially truncated array string.
 * Walks the string tracking brace depth; each time depth returns to 0 we
 * have a complete top-level object. Returns only those objects, ignoring
 * any partial trailing object caused by an output token cut-off.
 */
function parseJsonArraySafe(raw: string): any[] {
  const start = raw.indexOf('[')
  if (start === -1) return []
  const str = raw.slice(start)

  // Fast path — try the full string first
  try {
    const parsed = JSON.parse(str)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    // Fall through to salvage mode
  }

  // Salvage: collect slices that cover exactly one top-level object
  const objects: any[] = []
  let depth = 0
  let objStart = -1
  let inString = false
  let escape = false

  for (let i = 0; i < str.length; i++) {
    const ch = str[i]

    if (escape) { escape = false; continue }
    if (ch === '\\' && inString) { escape = true; continue }
    if (ch === '"') { inString = !inString; continue }
    if (inString) continue

    if (ch === '{') {
      if (depth === 0) objStart = i
      depth++
    } else if (ch === '}') {
      depth--
      if (depth === 0 && objStart !== -1) {
        try {
          objects.push(JSON.parse(str.slice(objStart, i + 1)))
        } catch {
          // malformed object — skip it
        }
        objStart = -1
      }
    }
  }

  return objects
}

export async function scanForStories(
  area: ArticleArea,
  recentlyCovered: { headline: string }[] = [],
): Promise<GeminiSuggestion[]> {
  const config = AREA_CONFIGS[area]

  const recentlyCoveredBlock = recentlyCovered.length
    ? `\nIMPORTANT: Do NOT suggest stories that are semantically similar to any of the following recently covered topics.
A story is "too similar" if it covers the same event, policy, company announcement, or trend — even if the headline wording differs.

Recently covered (do not repeat):
${recentlyCovered.map((r) => `- "${r.headline}"`).join('\n')}
\n`
    : ''

  const prompt = config.prompt(recentlyCoveredBlock)
  const raw = await callResearch(prompt, config.system)

  const stories = parseJsonArraySafe(raw)

  if (!stories.length) {
    console.error(`[research] Failed to parse scanForStories(${area}) response — raw:`, raw.slice(0, 500))
    return []
  }

  // Ensure area is set correctly even if the AI drifts
  return stories.map((s: any) => ({ ...s, area }))
}

// ─── Re-prioritize existing suggestions ──────────────────────────────────────

export async function rePrioritizeExisting(
  suggestions: { id: string; headline: string; summary: string; discoveredAt: string }[]
): Promise<RePrioritized[]> {
  if (!suggestions.length) return []

  const SYSTEM = `You are an editorial assistant for Inspiria Digital.
You track how news stories are developing and adjust their priority accordingly.
You MUST respond with valid JSON only.`

  const list = suggestions
    .map((s, i) => `${i + 1}. [ID: ${s.id}] "${s.headline}" — discovered: ${s.discoveredAt}\n   ${s.summary}`)
    .join('\n\n')

  const prompt = `Search the web for the current status of these pending news stories for Inspiria Digital, a Canadian business news publication.

Stories to evaluate:
${list}

For each story, determine:
1. Has this story developed further? (bump priority)
2. Is it still current and relevant? (maintain)
3. Has it gone stale or been superseded? (drop priority or mark stale)

Return a JSON array:
[
  {
    "id": "the exact ID provided",
    "newPriority": 82,
    "newReason": "Story has developed — X announced Y today, making this more urgent",
    "markStale": false
  }
]

Include an entry for every story in the list.`

  const raw = await callResearch(prompt, SYSTEM)
  const match = raw.match(/\[[\s\S]*\]/)

  try {
    const parsed = JSON.parse(match ? match[0] : raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (e) {
    console.error('[research] Failed to parse rePrioritize response:', e)
    return []
  }
}

// ─── Fact-check + enrich a specific story ────────────────────────────────────

export async function factCheckAndEnrich(
  headline: string,
  keyPoints: string[],
  geminiContext: string
): Promise<FactCheckResult> {
  const SYSTEM = `You are a fact-checker and research analyst for Inspiria Digital.
Your job is to verify claims and add depth before an article is written.
You MUST respond with valid JSON only.`

  const prompt = `Search the web to verify and enrich this story for Inspiria Digital before writing:

Headline: "${headline}"

Key points to verify:
${keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

Existing context:
${geminiContext}

Search for current sources. Return:
{
  "verified": true,
  "corrections": ["If any key point was wrong or outdated, note the correction here"],
  "additionalContext": "New details, quotes, numbers, or angles found during fact-check. 150-200 words. This goes directly to the writer.",
  "updatedKeyPoints": ["Revised or confirmed key point 1", "Key point 2", "Key point 3", "New key point if found"]
}

If the story checks out, corrections can be an empty array.
If sources are unavailable or story can't be verified, set verified: false and explain in corrections.`

  const raw = await callResearch(prompt, SYSTEM)
  const match = raw.match(/\{[\s\S]*\}/)

  try {
    return JSON.parse(match ? match[0] : raw) as FactCheckResult
  } catch (e) {
    console.error('[research] Failed to parse factCheck response:', e)
    return {
      verified: false,
      corrections: ['Research fact-check failed to parse'],
      additionalContext: geminiContext,
      updatedKeyPoints: keyPoints,
    }
  }
}
