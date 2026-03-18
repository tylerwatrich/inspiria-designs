/**
 * CRON B — Writer
 *
 * Schedule: Mon/Wed/Fri at 10am and 3pm UTC (0 10,15 * * 1,3,5)
 * URL: https://inspiriadigital.com/api/cron/write-post
 * Header: Authorization: Bearer YOUR_CRON_SECRET
 */

import { NextRequest, NextResponse, after } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { deliberate } from '@/lib/editorialQueue'
import { factCheckAndEnrich } from '@/lib/geminiResearch'
import { writeArticleFromSuggestion, articleToPayload } from '@/lib/aiWriter'
import { automationGuard } from '@/lib/automationGuard'
import { generateArticleImage, saveImageToMedia } from '@/lib/imageGenerator'

export const maxDuration = 300

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await getPayload({ config })

  const guard = await automationGuard(payload)
  if (!guard.check('autoWriteEnabled')) {
    return guard.pausedResponse('Autonomous writing is paused.')
  }

  // Quick DB check — bail early if nothing to write
  const { docs: approved } = await payload.find({
    collection: 'article-suggestions',
    where: { status: { equals: 'approved' } },
    limit: 15,
    sort: '-priority',
  })

  if (!approved.length) {
    console.log('[write-post] No approved suggestions. Nothing to write.')
    return NextResponse.json({ success: true, message: 'No approved suggestions' })
  }

  console.log(`[write-post] ${approved.length} approved suggestions in queue`)

  // Return immediately so cron-job.org doesn't time out — heavy work runs in background
  after(async () => {
    // ─── Step 1: Claude deliberates ──────────────────────────────────────────

    const decision = await deliberate(
      approved.map((d: any) => ({
        id: String(d.id),
        headline: d.headline,
        summary: d.summary,
        vertical: d.vertical,
        priority: d.priority,
        priorityReason: d.priorityReason,
        keyPoints: d.keyPoints ?? [],
        discoveredAt: d.discoveredAt,
        scheduledFor: d.scheduledFor,
      }))
    )

    if (!decision) {
      console.log('[write-post] No eligible suggestions (all scheduled for future)')
      return
    }

    console.log(`[write-post] Claude selected: "${decision.selectedId}" — ${decision.reasoning}`)

    const chosen = approved.find((d: any) => String(d.id) === decision.selectedId)
    if (!chosen) {
      console.error('[write-post] Claude selected an ID not in the approved list')
      return
    }

    for (const skip of decision.skipped) {
      try {
        await payload.update({
          collection: 'article-suggestions',
          id: skip.id,
          data: { claudeEditorialNote: `Skipped this run: ${skip.reason}` },
        })
      } catch { /* non-fatal */ }
    }

    // ─── Step 2: Fact-check the chosen story ─────────────────────────────────

    console.log(`[write-post] Fact-checking "${chosen.headline}"...`)

    let factCheck = {
      verified: true,
      corrections: [] as string[],
      additionalContext: '',
      updatedKeyPoints: (chosen.keyPoints ?? []).map((k: any) => k.point),
    }

    try {
      factCheck = await factCheckAndEnrich(
        chosen.headline,
        (chosen.keyPoints ?? []).map((k: any) => k.point),
        chosen.geminiContext ?? ''
      )
      console.log(`[write-post] Fact-check complete. Verified: ${factCheck.verified}`)
      if (factCheck.corrections.length) {
        console.log('[write-post] Corrections:', factCheck.corrections)
      }
    } catch (e) {
      console.error('[write-post] Fact-check failed (proceeding with original context):', e)
    }

    // ─── Step 3: Claude writes the article ───────────────────────────────────

    console.log('[write-post] Writing article...')

    let article
    try {
      article = await writeArticleFromSuggestion({
        headline: chosen.headline,
        summary: chosen.summary,
        keyPoints: factCheck.updatedKeyPoints,
        geminiContext: chosen.geminiContext ?? '',
        additionalContext: factCheck.additionalContext,
        editorial: decision.reasoning,
        vertical: chosen.vertical,
      })
    } catch (e) {
      console.error('[write-post] Article writing failed:', e)
      return
    }

    // ─── Step 4: Generate hero image ──────────────────────────────────────────

    console.log('[write-post] Generating hero image...')
    const bflUrl = await generateArticleImage(article.title, chosen.vertical)
    let heroImageId: number | null = null
    if (bflUrl) {
      heroImageId = await saveImageToMedia(bflUrl, article.title, payload)
      if (!heroImageId) {
        console.log('[write-post] Media save failed — proceeding without image')
      }
    } else {
      console.log('[write-post] Image generation skipped or failed — proceeding without image')
    }

    // ─── Step 5: Publish to Posts ─────────────────────────────────────────────

    const status = guard.check('autoPublishEnabled') ? 'published' : 'draft'

    let post
    try {
      post = await payload.create({
        collection: 'posts',
        data: {
          ...articleToPayload(article),
          _status: status,
          ...(heroImageId ? { heroImage: heroImageId } : {}),
        },
      })
      console.log(`[write-post] ${status === 'published' ? 'Published' : 'Saved as draft'}: "${post.title}" (id: ${post.id})`)
    } catch (e) {
      console.error('[write-post] Failed to publish post:', e)
      return
    }

    // ─── Step 6: Create FAQs and link to post ────────────────────────────────

    if (article.faqs?.length) {
      try {
        const faqIds: number[] = []
        for (const faq of article.faqs) {
          const created = await payload.create({
            collection: 'faqs',
            data: { question: faq.question, answer: faq.answer },
          })
          faqIds.push(created.id)
        }
        await payload.update({
          collection: 'posts',
          id: post.id,
          data: { faqs: faqIds },
        })
        console.log(`[write-post] Created and linked ${faqIds.length} FAQs`)
      } catch (e) {
        console.error('[write-post] FAQ creation failed (non-fatal):', e)
      }
    }

    // ─── Step 7: Mark suggestion as published ────────────────────────────────

    await payload.update({
      collection: 'article-suggestions',
      id: chosen.id,
      data: {
        status: 'published',
        publishedPost: post.id,
        claudeEditorialNote: decision.reasoning,
      },
    })

    console.log(`[write-post] Done — "${post.title}" saved as ${status}`)
  })

  return NextResponse.json({ success: true, message: 'Writing started' })
}
