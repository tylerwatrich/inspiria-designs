/**
 * Article updater — checks if a published article has new developments worth appending.
 */

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!
const GEMINI_API_KEY = process.env.GEMINI_API_KEY!
const GEMINI_MODEL = 'gemini-2.0-flash'

export type DevelopmentCheck = {
  hasNewInfo: boolean
  summary: string
  newDetails: string
  sources: { url: string; title: string }[]
}

export async function checkForDevelopments(
  title: string,
  originalContent: string,
  existingUpdates: string[],
): Promise<DevelopmentCheck> {
  const alreadyCovered = existingUpdates.length
    ? `\n\nPrevious updates already applied to this article:\n${existingUpdates.map((u, i) => `${i + 1}. ${u}`).join('\n')}`
    : ''

  const prompt = `Search the web for recent developments on this topic from Inspiria Digital, a Canadian business news publication.

ARTICLE TITLE: "${title}"

ORIGINAL ARTICLE SUMMARY:
${originalContent.slice(0, 1500)}${originalContent.length > 1500 ? '...' : ''}
${alreadyCovered}

Search for any NEW developments on this topic published in the last 7 days that are NOT already covered in the article above.

Be strict about what counts as "new":
- New policy announcements, company decisions, market moves: YES
- Commentary or opinions on the same old news: NO
- Follow-up statistics or data that updates figures in the article: YES
- Rehashes of what the article already covers: NO

Respond with JSON only:
{
  "hasNewInfo": true,
  "summary": "One-line description of what's new (or empty string if nothing)",
  "newDetails": "Full context, quotes, figures — everything a writer needs to add an update paragraph. 100-150 words. Empty string if nothing new.",
  "sources": [{"url": "...", "title": "..."}]
}

If nothing genuinely new was found, set hasNewInfo to false and leave other fields as empty strings/arrays.`

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        tools: [{ google_search: {} }],
        generationConfig: { temperature: 0.2 },
      }),
    }
  )

  const data = await res.json()
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  const clean = raw.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()

  try {
    return JSON.parse(clean) as DevelopmentCheck
  } catch {
    return { hasNewInfo: false, summary: '', newDetails: '', sources: [] }
  }
}

export type UpdateBlock = {
  updateText: string
}

export async function writeUpdateBlock(
  articleTitle: string,
  updateNumber: number,
  newDetails: string,
  summary: string,
): Promise<UpdateBlock> {
  const prompt = `You are a journalist at Inspiria Digital adding an update to a previously published article.

ARTICLE: "${articleTitle}"
UPDATE #${updateNumber}

NEW INFORMATION FROM RESEARCH:
${newDetails}

Write a concise update block (1-3 short paragraphs, 80-150 words total) to append to the bottom of this article.

Rules:
- Lead with the most important new fact
- Write in present/past tense as appropriate for news
- Don't recap the original article — readers have already read it
- No filler phrases like "In a new development..." — just state the news
- Journalistic tone, no marketing language
- End with context or implication if relevant

Return JSON only:
{
  "updateText": "The full update text. Paragraph breaks as \\n\\n."
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
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  const data = await res.json()
  const raw = data.content[0].text.trim()
  const clean = raw.replace(/^```json\n?/, '').replace(/\n?```$/, '')

  try {
    return JSON.parse(clean) as UpdateBlock
  } catch {
    return { updateText: newDetails }
  }
}

export function appendUpdateToLexical(
  existingLexical: any,
  updateNumber: number,
  updatedAt: Date,
  updateText: string,
): any {
  const dateStr = updatedAt.toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  function makeText(text: string, format = 0) {
    return { detail: 0, format, mode: 'normal', style: '', text, type: 'text', version: 1 }
  }

  function makeParagraph(text: string) {
    return {
      children: [makeText(text)],
      direction: 'ltr', format: '', indent: 0,
      type: 'paragraph', version: 1,
    }
  }

  const divider = { type: 'horizontalrule', version: 1 }

  const updateHeading = {
    children: [makeText(`Update #${updateNumber} — ${dateStr}`, 1)],
    direction: 'ltr', format: '', indent: 0,
    tag: 'h3', type: 'heading', version: 1,
  }

  const paragraphNodes = updateText
    .split('\n\n')
    .filter(Boolean)
    .map(makeParagraph)

  const newNodes = [divider, updateHeading, ...paragraphNodes]

  const updated = JSON.parse(JSON.stringify(existingLexical))
  updated.root.children.push(...newNodes)
  return updated
}
