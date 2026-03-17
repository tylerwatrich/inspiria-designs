/**
 * Quality checker — Claude reads each article and scores it for AI slop and incoherence.
 */

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!

const SYSTEM = `You are a senior editor at Inspiria Digital, a Canadian business news publication.
Your job is to audit articles for quality problems — specifically AI-generated filler and incoherence.
You are rigorous, specific, and unsentimental. You call out problems clearly.
You MUST respond with valid JSON only. No preamble, no markdown fences.`

export type QualityResult = {
  score: number
  flag: 'clean' | 'needs-attention' | 'ai-slop' | 'incoherent' | 'both'
  issues: string[]
  reviewNote: string
}

export async function reviewArticle(
  title: string,
  content: string
): Promise<QualityResult> {
  const prompt = `Review this article for Inspiria Digital and assess its quality.

TITLE: ${title}

ARTICLE:
${content}

---

Score this article from 0–100:
- 80–100: Solid journalism. Specific, coherent, no filler.
- 60–79: Acceptable but has identifiable weaknesses.
- 40–59: Needs significant editing. Noticeable problems.
- 0–39: Unpublishable in current state.

Assign a flag:
- "clean": Score 75+, no significant issues
- "needs-attention": Score 60–74, fixable issues present
- "ai-slop": Generic filler, vague claims, marketing language, no specific facts
- "incoherent": Logical gaps, contradictions, structural problems
- "both": Has both AI slop and incoherence problems

Be specific in your issues list. Don't say "lacks specificity" — say which paragraph and what's missing.

Return JSON:
{
  "score": 72,
  "flag": "needs-attention",
  "issues": [
    "Opening paragraph uses 'rapidly evolving landscape' — classic filler opener",
    "Paragraph 3 claims X but paragraph 5 implies the opposite without acknowledgment",
    "No specific numbers or named sources in the finance section",
    "Conclusion is generic and could apply to any article in this vertical"
  ],
  "reviewNote": "Solid reporting on the core news but weakened by a filler opener and a contradiction in the middle section. The finance angle needs a specific figure to be credible."
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
      max_tokens: 800,
      system: SYSTEM,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  const data = await res.json()
  const raw = data.content[0].text.trim()
  const clean = raw.replace(/^```json\n?/, '').replace(/\n?```$/, '')

  try {
    return JSON.parse(clean) as QualityResult
  } catch (e) {
    console.error('[reviewArticle] Parse failed:', e, '\nRaw:', raw)
    return {
      score: 0,
      flag: 'needs-attention',
      issues: ['Quality review parse failed — manual review needed'],
      reviewNote: 'Automated review failed to parse. Please review manually.',
    }
  }
}

export async function generateEditorialSummary(
  results: { title: string; score: number; flag: string }[],
  totalScanned: number
): Promise<string> {
  const flagged = results.filter((r) => r.flag !== 'clean')
  const avgScore = Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)

  const prompt = `You are the editor-in-chief of Inspiria Digital. Write a brief editorial quality summary for this month's content audit.

Stats:
- Total articles scanned: ${totalScanned}
- Flagged: ${flagged.length}
- Average quality score: ${avgScore}/100

Flagged articles:
${flagged.map((r) => `- "${r.title}" — ${r.flag} (score: ${r.score})`).join('\n')}

Write 3-4 sentences. Be direct. Note any patterns in the problems found.
Give an honest assessment of whether output quality is acceptable, improving, or declining.
Do not use filler phrases or hedge excessively.`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  const data = await res.json()
  return data.content[0].text.trim()
}

// ─── Lexical → plain text ─────────────────────────────────────────────────────

export function lexicalToText(lexical: any): string {
  if (!lexical?.root?.children) return ''

  function extractText(node: any): string {
    if (node.type === 'text') return node.text ?? ''
    if (!node.children) return ''
    return node.children.map(extractText).join(node.type === 'paragraph' ? '\n\n' : ' ')
  }

  return lexical.root.children.map(extractText).join('\n\n').trim()
}
