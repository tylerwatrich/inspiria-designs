/**
 * AI Writer — writes articles from approved, fact-checked suggestions.
 * Accepts rich context from Gemini so Claude only has to write, not research.
 */

import { toLexical } from './toLexical'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!

const SYSTEM_PROMPT = `You are a practical, clear-headed business journalist writing for Inspiria Digital — a Canadian business news publication for small business owners running businesses with 1–50 employees.

Your writing is direct and advice-oriented. You translate news into implications: what does this mean for someone managing a team, watching their margins, applying for financing, or deciding whether to invest in new tools? Think Canadian Business meets The Globe's Report on Business small business section — no fluff, no filler, but always grounded in what an owner actually needs to know.

Every article must include a "What This Means for Your Business" section (heading level 2) near the end — 1–2 paragraphs that translate the story into concrete actions or considerations for a small business owner.

You are given a researched story brief with verified facts. Your job is to write the article. Trust the research but apply editorial judgment to the angle and framing.

You MUST respond with valid JSON only. No preamble, no markdown fences.`

export type ArticleInput = {
  headline: string
  summary: string
  keyPoints: string[]
  geminiContext: string
  additionalContext: string
  editorial: string
  vertical: string
}

export type ArticleJSON = {
  title: string
  slug: string
  excerpt: string
  category: string
  content: Array<
    { type: 'paragraph'; text: string } | { type: 'heading'; level: 2 | 3; text: string }
  >
  articleSummary: string
  metaDescription: string
  keyTakeaways: string[]
  faqs: Array<{ question: string; answer: string }>
}

export async function writeArticleFromSuggestion(input: ArticleInput): Promise<ArticleJSON> {
  const userPrompt = `Write a business news article for Inspiria Digital using this researched brief:

HEADLINE: ${input.headline}
VERTICAL: ${input.vertical}

EDITORIAL ANGLE: ${input.editorial}

SUMMARY: ${input.summary}

KEY FACTS (verified):
${input.keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

RESEARCH CONTEXT:
${input.geminiContext}

ADDITIONAL CONTEXT (from fact-check):
${input.additionalContext}

Write a full article aimed at Canadian small business owners. Do not invent facts not present in the brief. If there are gaps, acknowledge uncertainty rather than speculate.

The content array MUST include, near the end:
{ "type": "heading", "level": 2, "text": "What This Means for Your Business" }
followed by 1–2 paragraph blocks translating the story into concrete actions or considerations for a small business owner.

Return JSON:
{
  "title": "Final headline (can differ from the brief if you have a better angle)",
  "slug": "url-friendly-slug",
  "excerpt": "2-sentence summary for the article card (max 60 words)",
  "category": "${input.vertical}",
  "content": [
    { "type": "paragraph", "text": "Opening paragraph..." },
    { "type": "heading", "level": 2, "text": "Section heading" },
    { "type": "paragraph", "text": "Body..." },
    { "type": "heading", "level": 2, "text": "What This Means for Your Business" },
    { "type": "paragraph", "text": "Practical implications for small business owners..." }
  ],
  "articleSummary": "2-3 sentence overview of what this article covers. Displayed at the top of the post. Max 400 characters.",
  "metaDescription": "SEO meta description. 150-160 characters. Value-first, no clickbait.",
  "keyTakeaways": [
    "Most important insight from the article",
    "Second key point",
    "Third key point",
    "Fourth key point",
    "Fifth key point",
    "Sixth key point"
  ],
  "faqs": [
    { "question": "Specific question a reader would ask after reading this article", "answer": "Direct, thorough answer in 2-4 sentences." }
  ]
}

Write 7–10 content blocks, 600–900 words total. Lead with the most newsworthy element. No marketing language. Include exactly 6 keyTakeaways and 3-5 faqs.`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 2500,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  })

  const data = await res.json()
  const raw = data.content[0].text.trim()
  const clean = raw.replace(/^```json\n?/, '').replace(/\n?```$/, '')
  return JSON.parse(clean) as ArticleJSON
}

export function articleToPayload(article: ArticleJSON) {
  return {
    title: article.title,
    slug: article.slug,
    content: toLexical(article.content),
    articleSummary: article.articleSummary,
    meta: {
      description: article.metaDescription,
    },
    keyTakeaways: article.keyTakeaways.slice(0, 6).map((point) => ({ point })),
    _status: 'published' as const,
  }
}

// ─── Standalone article generator (for /api/ai-write manual trigger) ─────────

export async function generateArticle(topic?: string): Promise<ArticleJSON> {
  const topicLine = topic
    ? `TOPIC: ${topic}`
    : 'TOPIC: A timely Canadian business or technology story of your choosing. Pick something with genuine analytical depth.'

  const userPrompt = `Write a business news article for Inspiria Digital — a Canadian business news publication.

${topicLine}

Research the topic using your knowledge and write a complete, publication-ready article.

Return JSON:
{
  "title": "Compelling headline",
  "slug": "url-friendly-slug",
  "excerpt": "2-sentence summary (max 60 words)",
  "category": "one of: nuclear | ai-cloud | construction-tech | finance | trade | deep-tech | general",
  "content": [
    { "type": "paragraph", "text": "Opening paragraph..." },
    { "type": "heading", "level": 2, "text": "Section heading" },
    { "type": "paragraph", "text": "Body..." }
  ]
}

Write 7–10 content blocks, 600–900 words total. Lead with the most newsworthy element. No marketing language. No speculation presented as fact.`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 2500,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  })

  const data = await res.json()
  const raw = data.content[0].text.trim()
  const clean = raw.replace(/^```json\n?/, '').replace(/\n?```$/, '')
  return JSON.parse(clean) as ArticleJSON
}
