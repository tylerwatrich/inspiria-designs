/**
 * Editorial queue — Claude deliberates over approved suggestions and picks one to write.
 * This is the "judgment" layer between Gemini's priority scores and actual publishing.
 */

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!

type QueueItem = {
  id: string
  headline: string
  summary: string
  vertical: string
  priority: number
  priorityReason: string
  keyPoints: { point: string }[]
  discoveredAt: string
  scheduledFor?: string
}

type EditorialDecision = {
  selectedId: string
  reasoning: string
  skipped: { id: string; reason: string }[]
}

export async function deliberate(
  queue: QueueItem[],
  recentlyPublished: { title: string; vertical: string }[] = []
): Promise<EditorialDecision | null> {
  if (!queue.length) return null

  const now = new Date()

  const available = queue.filter((item) => {
    if (!item.scheduledFor) return true
    return new Date(item.scheduledFor) <= now
  })

  if (!available.length) return null

  const sorted = [...available].sort((a, b) => b.priority - a.priority)

  const storyList = sorted
    .map(
      (s, i) => `
${i + 1}. [ID: ${s.id}] Priority: ${s.priority}/100
   Headline: "${s.headline}"
   Vertical: ${s.vertical}
   Discovered: ${s.discoveredAt}
   Why prioritized: ${s.priorityReason}
   Key points: ${s.keyPoints.map((k) => k.point).join(' | ')}
   Summary: ${s.summary}`.trim()
    )
    .join('\n\n')

  const recentlyPublishedBlock = recentlyPublished.length
    ? `\nIMPORTANT: The following topics were recently published. Do not select a story that covers the same event, announcement, or trend — even if framed differently. Editorial freshness matters.

Recently published (avoid repeating):
${recentlyPublished.map((r) => `- [${r.vertical}] "${r.title}"`).join('\n')}
`
    : ''

  const prompt = `You are the editorial director of Inspiria Digital, a Canadian business news publication targeting executives, investors, and tech professionals.

Today is ${now.toISOString()}.
${recentlyPublishedBlock}
You have ${available.length} approved story pitches in the queue. Your job is to select the single most compelling story to publish RIGHT NOW, based on:
- Timeliness (breaking/developing stories beat evergreen)
- Reader value (what does our audience actually need to know today?)
- Editorial balance (avoid over-covering one vertical back-to-back if possible)
- News momentum (is this story peaking or fading?)

The queue:

${storyList}

Respond with JSON only:
{
  "selectedId": "the exact ID of the story to write now",
  "reasoning": "2-3 sentences explaining why this story, why now, and what angle to lead with",
  "skipped": [
    { "id": "other-id", "reason": "brief reason it wasn't chosen" }
  ]
}`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  const data = await res.json()
  if (!data.content?.[0]?.text) {
    throw new Error(`[deliberate] Anthropic API error: ${JSON.stringify(data)}`)
  }
  const raw = data.content[0].text.trim()
  const clean = raw.replace(/^```json\n?/, '').replace(/\n?```$/, '')

  try {
    return JSON.parse(clean) as EditorialDecision
  } catch (e) {
    console.error('[deliberate] Failed to parse Claude decision:', e)
    return {
      selectedId: sorted[0].id,
      reasoning: 'Fallback: selected highest priority item (JSON parse failed)',
      skipped: sorted.slice(1).map((s) => ({ id: s.id, reason: 'Not selected in fallback' })),
    }
  }
}
