/**
 * CRON — Logistics Context Updater
 *
 * Schedule: 1st of every month at 7am UTC (0 7 1 * *) — offset from quality-audit (6am)
 * URL: https://inspiriadigital.com/api/cron/update-logistics
 * Header: Authorization: Bearer YOUR_CRON_SECRET
 *
 * Reviews every known province → market logistics blurb using Claude.
 * Skips pairs reviewed within the last 28 days.
 * Creates new DB records for any static pair not yet in the DB.
 * Updates confidence to 'stale' for records older than 90 days.
 *
 * TO SWITCH TO GEMINI: replace `researchLogisticsBlurb()` below with a call
 * to `factCheckAndEnrich()` or a dedicated Gemini web-search function.
 * The rest of the cron is research-method-agnostic.
 */

import { NextRequest, NextResponse, after } from 'next/server'
import { getPayload } from 'payload'
import type { CollectionSlug } from 'payload'
import config from '@payload-config'

// 'logistics-context' is registered in payload.config but types may lag regeneration
const LOGISTICS_COLLECTION = 'logistics-context' as CollectionSlug

export const maxDuration = 300

// All province → market pairs from the static PROVINCE_CONTEXT in data.ts.
// Add new pairs here as the compass expands — the cron will seed them automatically.
const STATIC_PAIRS: Array<{ province: string; market: string }> = [
  { province: 'British Columbia', market: 'Japan' },
  { province: 'British Columbia', market: 'China' },
  { province: 'British Columbia', market: 'South Korea' },
  { province: 'British Columbia', market: 'Australia' },
  { province: 'British Columbia', market: 'United States' },
  { province: 'Ontario', market: 'United States' },
  { province: 'Ontario', market: 'Germany' },
  { province: 'Ontario', market: 'United Kingdom' },
  { province: 'Ontario', market: 'Mexico' },
  { province: 'Quebec', market: 'United Kingdom' },
  { province: 'Quebec', market: 'Germany' },
  { province: 'Quebec', market: 'United States' },
  { province: 'Quebec', market: 'France' },
  { province: 'Alberta', market: 'United States' },
  { province: 'Alberta', market: 'Japan' },
  { province: 'Alberta', market: 'South Korea' },
  { province: 'Alberta', market: 'China' },
  { province: 'Saskatchewan', market: 'United States' },
  { province: 'Saskatchewan', market: 'China' },
  { province: 'Saskatchewan', market: 'Japan' },
  { province: 'Saskatchewan', market: 'India' },
]

const REVIEW_INTERVAL_DAYS = 28
const STALE_THRESHOLD_DAYS = 90

// ─── RESEARCH FUNCTION ─────────────────────────────────────────────────────────
//
// This is the only function that needs to change when switching to Gemini.
// Gemini swap: replace the Claude API call here with factCheckAndEnrich() or
// a new geminiResearch() call that web-searches for current port/logistics news.
//
async function researchLogisticsBlurb(
  province: string,
  market: string,
  existingNote: string,
): Promise<{ note: string; changed: boolean; reasoning: string }> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set')

  const prompt = `You are a Canadian trade logistics expert. Write a single logistics blurb (1–2 sentences, max 30 words) describing the best way for exporters from ${province} to ship goods to ${market}. Focus on: port access, border crossings, rail corridors, or air freight links — whichever is most relevant for this route. Be specific and practical. Do not mention company names. Use plain language.

Current blurb: "${existingNote}"

Reply with a JSON object:
{
  "note": "<new blurb — 1-2 sentences>",
  "changed": <true if meaningfully different from current blurb, false if essentially the same>,
  "reasoning": "<one sentence explaining what changed or why it stayed the same>"
}`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001', // Haiku — cheap, fast, sufficient for short blurbs
      max_tokens: 256,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Claude API error ${res.status}: ${text.slice(0, 200)}`)
  }

  const json = await res.json()
  const raw = json.content?.[0]?.text ?? ''

  // Strip markdown code fences if present
  const cleaned = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
  return JSON.parse(cleaned)
}

// ─── HELPERS ───────────────────────────────────────────────────────────────────

function daysSince(dateStr: string | null | undefined): number {
  if (!dateStr) return Infinity
  return (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24)
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

// ─── CRON HANDLER ──────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  after(async () => {
    const payload = await getPayload({ config })

    // Load all existing DB records into a lookup map
    const { docs: existing } = await payload.find({
      collection: LOGISTICS_COLLECTION,
      limit: 500,
      pagination: false,
    })

    const recordMap = new Map<string, (typeof existing)[number]>()
    for (const doc of existing) {
      recordMap.set(`${doc.province}||${doc.market}`, doc)
    }

    // Merge static pairs with any extra pairs already in the DB
    const dbOnlyPairs = existing
      .filter((doc) => !STATIC_PAIRS.some((p) => p.province === doc.province && p.market === doc.market))
      .map((doc) => ({ province: doc.province as string, market: doc.market as string }))

    const allPairs = [...STATIC_PAIRS, ...dbOnlyPairs]

    const summary: string[] = []

    for (const { province, market } of allPairs) {
      const key = `${province}||${market}`
      const record = recordMap.get(key)
      const age = daysSince(record?.lastReviewed as string | undefined)

      // Mark stale before deciding whether to skip
      if (record && age > STALE_THRESHOLD_DAYS && record.confidence !== 'stale') {
        await payload.update({
          collection: LOGISTICS_COLLECTION,
          id: record.id,
          data: { confidence: 'stale' },
        })
      }

      if (age < REVIEW_INTERVAL_DAYS) {
        summary.push(`SKIP ${province} → ${market} (reviewed ${Math.floor(age)}d ago)`)
        continue
      }

      // Seed static note as the starting point if no DB record yet
      const existingNote = (record?.note as string) ?? ''

      let result: { note: string; changed: boolean; reasoning: string }
      try {
        result = await researchLogisticsBlurb(province, market, existingNote)
      } catch (err) {
        summary.push(`ERROR ${province} → ${market}: ${String(err).slice(0, 80)}`)
        await sleep(2000)
        continue
      }

      const today = new Date().toISOString().split('T')[0]

      if (record) {
        await payload.update({
          collection: LOGISTICS_COLLECTION,
          id: record.id,
          data: {
            note: result.note,
            confidence: 'verified',
            lastReviewed: today,
            cronNotes: result.reasoning,
          },
        })
        summary.push(
          `${result.changed ? 'UPDATED' : 'CONFIRMED'} ${province} → ${market}: ${result.reasoning}`,
        )
      } else {
        await payload.create({
          collection: LOGISTICS_COLLECTION,
          data: {
            province,
            market,
            note: result.note,
            confidence: 'verified',
            lastReviewed: today,
            cronNotes: `Seeded by cron. ${result.reasoning}`,
          },
        })
        summary.push(`CREATED ${province} → ${market}`)
      }

      // Rate-limit: ~1 Claude call per 2 seconds
      await sleep(2000)
    }

    console.log('[update-logistics] Run complete:\n' + summary.join('\n'))
  })

  return NextResponse.json({ success: true, message: 'Logistics review started' })
}
