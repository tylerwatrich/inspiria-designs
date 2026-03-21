/**
 * Industry Review Writer
 *
 * Generates monthly industry / job market reviews using Claude.
 * Called by the monthly-review and mid-month-review cron routes.
 */

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!

const SYSTEM_PROMPT = `You are a Canadian economic analyst and labour market researcher writing for Inspiria Digital — a business news site for Canadian small business owners and job seekers.

Your job is to write structured, practical industry and job market reviews covering the Canadian economy. Your analysis should reflect current conditions, draw from Statistics Canada data patterns, Bank of Canada signals, CFIB sentiment reports, and Canadian job board trends.

Your audience:
- Small business owners (1–50 employees) deciding whether to expand, pivot, or hold
- Job seekers evaluating which sectors have real hiring momentum vs. which are contracting
- Entrepreneurs considering which industries to start a business in

Tone: Direct, practical, data-informed. No fluff. Every insight should be actionable. Think Globe and Mail Report on Business meets Canadian Business magazine.

You MUST respond with valid JSON only. No preamble, no markdown fences, no explanation.`

export type IndustryEntry = {
  name: string
  growthScore: number
  highlights: string
  jobOutlook: string
  businessOpportunity: string
}

export type DownturnEntry = {
  name: string
  declineScore: number
  highlights: string
  riskFactors: string
  pivotSuggestions: string
}

export type IndustryReviewJSON = {
  title: string
  slug: string
  reviewMonth: string
  executiveSummary: string
  thrivingIndustries: IndustryEntry[]
  downturnedIndustries: DownturnEntry[]
  keyTrends: string[]
  forBusinessOwners: string
  forJobSeekers: string
}

export async function writeIndustryReview(
  reviewMonth: string,
  reviewType: 'monthly-review' | 'mid-month-update',
): Promise<IndustryReviewJSON> {
  const isUpdate = reviewType === 'mid-month-update'
  const label = isUpdate ? `${reviewMonth} Mid-Month Update` : `${reviewMonth} Industry & Job Market Review`
  const slugBase = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const userPrompt = `Generate a ${isUpdate ? 'mid-month update' : 'full monthly review'} of the Canadian industry and job market for ${reviewMonth}.

${isUpdate ? `This is a mid-month pulse check — focus on notable shifts since the start of the month, emerging signals, and anything that has changed materially in the past 2 weeks. Keep analysis tighter and more news-driven than the full monthly review.` : `This is the full monthly review — provide comprehensive analysis of all major sectors, current hiring trends, and strategic implications for small business owners and job seekers.`}

Return a JSON object with this exact structure:
{
  "title": "${label}",
  "slug": "${slugBase}",
  "reviewMonth": "${reviewMonth}",
  "executiveSummary": "2–4 sentence overview of the current Canadian market landscape",
  "thrivingIndustries": [
    {
      "name": "Industry name",
      "growthScore": 8,
      "highlights": "What is driving growth — be specific with data signals where possible",
      "jobOutlook": "Specific roles in demand, hiring pace, salary trend direction",
      "businessOpportunity": "Concrete ways a small business owner could capitalize on this sector"
    }
  ],
  "downturnedIndustries": [
    {
      "name": "Industry name",
      "declineScore": 7,
      "highlights": "What is causing the downturn — be specific",
      "riskFactors": "Specific risks for businesses and workers in this sector right now",
      "pivotSuggestions": "Adjacent sectors or strategic pivots worth considering"
    }
  ],
  "keyTrends": [
    "Cross-sector trend 1 affecting multiple industries",
    "Cross-sector trend 2"
  ],
  "forBusinessOwners": "2–4 sentences of direct, actionable advice for Canadian small business owners based on this month's picture",
  "forJobSeekers": "2–4 sentences of direct, actionable advice for Canadian job seekers based on this month's picture"
}

Requirements:
- thrivingIndustries: include 4–6 industries
- downturnedIndustries: include 3–5 industries
- keyTrends: include 3–5 trends
- growthScore and declineScore must be integers 1–10
- All analysis must be grounded in realistic Canadian economic conditions
- Be specific — name actual sub-sectors, roles, and signals rather than being vague
- Focus on Canada, not the US (though note US tariff/trade impacts where relevant)
`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-6',
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  })

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  const text = data.content?.[0]?.text ?? ''

  let parsed: IndustryReviewJSON
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error(`Failed to parse industry review JSON: ${text.slice(0, 200)}`)
  }

  return parsed
}
