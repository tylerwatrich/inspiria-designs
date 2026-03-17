/**
 * CRON C — Monthly quality audit + older post updates
 *
 * Schedule: 1st of every month at 6am UTC (0 6 1 * *)
 * URL: https://inspiria.ca/api/cron/quality-audit
 * Header: Authorization: Bearer YOUR_CRON_SECRET
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { reviewArticle, generateEditorialSummary, lexicalToText } from '@/lib/qualityChecker'
import { runUpdatePass } from '@/lib/updateRunner'
import { automationGuard } from '@/lib/automationGuard'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await getPayload({ config })

  const guard = await automationGuard(payload)
  if (!guard.check('qualityAuditEnabled') && !guard.check('monthlyUpdateEnabled')) {
    return guard.pausedResponse('Quality audit and monthly updates are both paused.')
  }

  const now = new Date()
  const monthLabel = now.toLocaleString('en-CA', { month: 'long', year: 'numeric' })
  const threeMonthsAgo = new Date()
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

  console.log(`[quality-audit] Starting monthly run — ${monthLabel}`)

  const { docs: allPosts, totalDocs } = await payload.find({
    collection: 'posts',
    where: { _status: { equals: 'published' } },
    limit: 500,
    depth: 0,
  })

  const olderPosts = allPosts.filter(
    (p: any) => new Date(p.createdAt) <= threeMonthsAgo
  )

  // ─── PART 1: Quality audit — ALL posts ──────────────────────────────────────

  const qualityResults: {
    post: any; title: string; score: number; flag: string; issues: string[]; reviewNote: string
  }[] = []

  if (guard.check('qualityAuditEnabled')) {
    for (const post of allPosts) {
      const plainText = lexicalToText(post.content)
      if (!plainText || plainText.length < 100) continue

      let result
      try {
        result = await reviewArticle(post.title, plainText)
      } catch (e) {
        result = {
          score: 0, flag: 'needs-attention' as const,
          issues: [`Review failed: ${String(e)}`],
          reviewNote: 'Automated review failed. Please review manually.',
        }
      }

      try {
        await payload.update({
          collection: 'posts',
          id: post.id,
          data: {
            qualityAudit: {
              score: result.score,
              flag: result.flag,
              issues: result.issues.map((issue: string) => ({ issue })),
              reviewNote: result.reviewNote,
              lastReviewedAt: now.toISOString(),
            },
          },
        })
      } catch (e) {
        console.error(`[quality-audit] Failed to save quality for "${post.title}":`, e)
      }

      qualityResults.push({ post: post.id, title: post.title, ...result })
      await sleep(500)
    }
  }

  // ─── PART 2: Update pass — older posts only ──────────────────────────────────

  const updateResults = guard.check('monthlyUpdateEnabled')
    ? await runUpdatePass(olderPosts, payload)
    : []

  const articlesUpdated = updateResults.filter((r) => r.updated)

  // ─── PART 3: Audit log ───────────────────────────────────────────────────────

  const flagged = qualityResults.filter((r) => r.flag !== 'clean').length
  const avgScore = qualityResults.length > 0
    ? Math.round(qualityResults.reduce((sum, r) => sum + r.score, 0) / qualityResults.length)
    : 0

  let editorialSummary = ''
  try {
    if (qualityResults.length > 0) {
      editorialSummary = await generateEditorialSummary(
        qualityResults.map((r) => ({ title: r.title, score: r.score, flag: r.flag })),
        totalDocs
      )
    }
  } catch {
    editorialSummary = `${qualityResults.length} reviewed, ${flagged} flagged, avg ${avgScore}/100.`
  }

  if (articlesUpdated.length > 0) {
    editorialSummary += `\n\nArticle updates: ${articlesUpdated.length} older posts received new developments (${articlesUpdated.map((r) => `"${r.title}"`).join(', ')}).`
  }

  try {
    await payload.create({
      collection: 'quality-reviews',
      data: {
        runLabel: `Monthly scan — ${monthLabel}`,
        scannedAt: now.toISOString(),
        totalScanned: qualityResults.length,
        flagged,
        avgScore,
        results: qualityResults.map((r) => ({
          post: r.post, title: r.title, score: r.score, flag: r.flag,
          issues: r.issues.map((issue) => ({ issue })),
          reviewNote: r.reviewNote,
        })),
        editorialSummary,
      },
    })
  } catch (e) {
    console.error('[quality-audit] Failed to create QualityReview record:', e)
  }

  return NextResponse.json({
    success: true,
    quality: { totalScanned: qualityResults.length, flagged, avgScore },
    updates: {
      olderPostsChecked: olderPosts.length,
      updated: articlesUpdated.length,
      articles: articlesUpdated.map((r) => ({ title: r.title, updateNumber: r.updateNumber, summary: r.summary })),
    },
  })
}
