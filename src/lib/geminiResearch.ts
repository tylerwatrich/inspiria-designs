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
    max_tokens: 4096,
    tools: [{ type: 'web_search_20250305', name: 'web_search' }],
    messages,
  }

  if (systemPrompt) {
    body.system = systemPrompt
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-beta': 'web-search-2025-03-05',
    },
    body: JSON.stringify(body),
  })

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

export type GeminiSuggestion = {
  headline: string
  summary: string
  keyPoints: string[]
  sources: { url: string; title: string }[]
  geminiContext: string
  vertical: 'nuclear' | 'ai-cloud' | 'construction-tech' | 'finance' | 'trade' | 'deep-tech'
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

// ─── Scan for news ────────────────────────────────────────────────────────────

export async function scanForStories(): Promise<GeminiSuggestion[]> {
  const SYSTEM = `You are a research analyst for Inspiria Digital, a Canadian business news publication.
Your job is to find real, current news stories that matter to Canadian small business owners — people running businesses with 1–50 employees who need to understand what news means for their operations, costs, and opportunities.
You MUST respond with valid JSON only. No preamble, no markdown fences.`

  const prompt = `Search the web right now for the most significant Canadian business and technology news from the past 6 hours, with a focus on impact for Canadian small business owners.

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

Find 4-6 distinct stories. For each, assign:

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
    "geminiContext": "All relevant details, numbers, quotes, and context a writer would need. Be thorough — 150-200 words.",
    "vertical": "one of: nuclear | ai-cloud | construction-tech | finance | trade | deep-tech",
    "priority": 75,
    "priorityReason": "Why this score — how significant is this story and why now?",
    "smbRelevance": 8
  }
]

Only include stories with actual sources you found. Do not fabricate.`

  const raw = await callResearch(prompt, SYSTEM)
  const match = raw.match(/\[[\s\S]*\]/)

  try {
    const parsed = JSON.parse(match ? match[0] : raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (e) {
    console.error('[research] Failed to parse scanForStories response:', e, '\nRaw:', raw)
    return []
  }
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
