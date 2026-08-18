/**
 * AI Writer — writes articles from approved, fact-checked suggestions.
 * Accepts rich context from Gemini so Claude only has to write, not research.
 */

import { toLexical } from './toLexical'
import type { ArticleArea } from './geminiResearch'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!

// ─── Area-specific system prompts ────────────────────────────────────────────

function getSystemPrompt(area: ArticleArea): string {
  switch (area) {
    case 'canadian-business-news':
      return `You are a practical, clear-headed business journalist writing for Inspiria Digital — a Canadian business news publication for small business owners running businesses with 1–50 employees.

Your writing is direct and advice-oriented. You translate news into implications: what does this mean for someone managing a team, watching their margins, applying for financing, or deciding whether to invest in new tools? Think Canadian Business meets The Globe's Report on Business small business section — no fluff, no filler, but always grounded in what an owner actually needs to know.

Every article must include a "What This Means for Your Business" section (heading level 2) near the end — 1–2 paragraphs that translate the story into concrete actions or considerations for a small business owner.

You are given a researched story brief with verified facts. Your job is to write the article. Trust the research but apply editorial judgment to the angle and framing.

You MUST respond with valid JSON only. No preamble, no markdown fences.`

    case 'industry-insights':
      return `You are a digital business advisor writing for Inspiria Digital, a Canadian web design agency. Your audience is business owners in specific Canadian industries — contractors, law firms, real estate professionals, and government procurement specialists — who are evaluating their digital presence and online strategy.

Your writing identifies real industry pain points, explains how they connect to a business's online strategy, and helps readers understand what a stronger digital presence would mean for them. You are not writing ads — you are writing genuinely useful industry insight that naturally positions digital investment as a logical consideration.

Structure your articles more like landing page resources than news feeds: lead with the pain point or industry pressure, provide practical context, and end with clear direction. Pages should help readers self-identify their need.

Every article must include a "What This Means for Your Digital Presence" section (heading level 2) near the end — 1–2 paragraphs on concrete digital actions specific to this industry.

You MUST respond with valid JSON only. No preamble, no markdown fences.`

    case 'resources':
      return `You are a clear, practical web advisor writing for Inspiria Digital, a Canadian web design agency. Your audience is Canadian small business owners who want to improve their online presence but aren't deeply technical.

Your writing is direct, educational, and action-oriented — think 'helpful expert', not salesperson. Lead with the practical insight. Use structured content (numbered or grouped points) where it helps clarity. Avoid jargon; when you must use a technical term, explain it in one sentence.

Every article must include a "Next Step" section (heading level 2) near the end — a single concrete action the reader can take after finishing the article.

You MUST respond with valid JSON only. No preamble, no markdown fences.`
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type ArticleInput = {
  headline: string
  summary: string
  keyPoints: string[]
  geminiContext: string
  additionalContext: string
  editorial: string
  vertical: string
  area: ArticleArea
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

// ─── Writer ───────────────────────────────────────────────────────────────────

export async function writeArticleFromSuggestion(input: ArticleInput): Promise<ArticleJSON> {
  const systemPrompt = getSystemPrompt(input.area)

  // Area-specific closing section instruction
  const closingSectionInstruction =
    input.area === 'industry-insights'
      ? '{ "type": "heading", "level": 2, "text": "What This Means for Your Digital Presence" }\nfollowed by 1–2 paragraph blocks on concrete digital actions for businesses in this industry.'
      : input.area === 'resources'
        ? '{ "type": "heading", "level": 2, "text": "Next Step" }\nfollowed by 1 paragraph block giving readers one concrete action to take.'
        : '{ "type": "heading", "level": 2, "text": "What This Means for Your Business" }\nfollowed by 1–2 paragraph blocks translating the story into concrete actions or considerations for a small business owner.'

  const userPrompt = `Write a business article for Inspiria Digital using this researched brief:

AREA: ${input.area}
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

Write a full article for the ${input.area} section. Do not invent facts not present in the brief. If there are gaps, acknowledge uncertainty rather than speculate.

The content array MUST include, near the end:
${closingSectionInstruction}

Return JSON:
{
  "title": "Final headline (can differ from the brief if you have a better angle)",
  "slug": "url-friendly-slug",
  "excerpt": "2-sentence summary for the article card (max 60 words)",
  "category": "${input.vertical}",
  "content": [
    { "type": "paragraph", "text": "Opening paragraph..." },
    { "type": "heading", "level": 2, "text": "Section heading" },
    { "type": "paragraph", "text": "Body..." }
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

Write 7–10 content blocks, 600–900 words total. Lead with the most compelling element. No marketing language. Include exactly 6 keyTakeaways and 3-5 faqs.`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-5',
      max_tokens: 2500,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  })

  const data = await res.json()
  const textBlock = data.content?.find((b: any) => b.type === 'text')
  if (!textBlock?.text) {
    throw new Error(`[writeArticleFromSuggestion] Anthropic API error: ${JSON.stringify(data)}`)
  }
  const raw = textBlock.text.trim()
  const clean = raw.replace(/^```json\n?/, '').replace(/\n?```$/, '')
  return JSON.parse(clean) as ArticleJSON
}

export function articleToPayload(article: ArticleJSON, areaId?: number) {
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
    ...(areaId ? { articleArea: areaId } : {}),
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
      model: 'claude-sonnet-5',
      max_tokens: 2500,
      system: getSystemPrompt('canadian-business-news'),
      messages: [{ role: 'user', content: userPrompt }],
    }),
  })

  const data = await res.json()
  const textBlock = data.content?.find((b: any) => b.type === 'text')
  if (!textBlock?.text) {
    throw new Error(`[generateArticle] Anthropic API error: ${JSON.stringify(data)}`)
  }
  const raw = textBlock.text.trim()
  const clean = raw.replace(/^```json\n?/, '').replace(/\n?```$/, '')
  return JSON.parse(clean) as ArticleJSON
}
