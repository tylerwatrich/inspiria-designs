/**
 * CRON — Image Generator
 *
 * Finds published posts with no heroImage and generates + saves one to Payload media.
 * Also backfills posts that have a heroImageUrl (temporary BFL link) but no heroImage.
 * Processes up to 3 posts per run to stay within Vercel function limits.
 *
 * Schedule: Daily, or after write-post runs (e.g. Mon/Wed/Fri at 11am UTC)
 * URL: https://inspiriadigital.com/api/cron/generate-images
 * Header: Authorization: Bearer YOUR_CRON_SECRET
 */

import { NextRequest, NextResponse, after } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { generateArticleImage, saveImageToMedia } from '@/lib/imageGenerator'

export const maxDuration = 300

const BATCH_SIZE = 3

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await getPayload({ config })

  const { docs: posts } = await payload.find({
    collection: 'posts',
    where: {
      and: [
        { _status: { equals: 'published' } },
        {
          or: [
            { heroImage: { exists: false } },
            { heroImage: { equals: null } },
          ],
        },
      ],
    },
    limit: BATCH_SIZE,
    sort: '-publishedAt',
  })

  if (!posts.length) {
    console.log('[generate-images] No posts need images.')
    return NextResponse.json({ success: true, message: 'No posts need images' })
  }

  console.log(`[generate-images] ${posts.length} post(s) queued for image generation`)

  after(async () => {
    const { token } = await payload.login({
      collection: 'users',
      data: {
        email: process.env.PAYLOAD_ADMIN_EMAIL!,
        password: process.env.PAYLOAD_ADMIN_PASSWORD!,
      },
    })

    for (const post of posts) {
      console.log(`[generate-images] Processing "${post.title}" (id: ${post.id})`)

      // If a temporary BFL URL exists, download it directly instead of regenerating
      const bflUrl = post.heroImageUrl ?? await generateArticleImage(post.title, '')

      if (!bflUrl) {
        console.error(`[generate-images] No image URL for "${post.title}" — skipping`)
        continue
      }

      const mediaId = await saveImageToMedia(bflUrl, post.title, { token: token! })
      if (!mediaId) {
        console.error(`[generate-images] Media save failed for "${post.title}" — skipping`)
        continue
      }

      try {
        await payload.update({
          collection: 'posts',
          id: post.id,
          data: { heroImage: mediaId },
        })
        console.log(`[generate-images] Updated "${post.title}" with media id: ${mediaId}`)
      } catch (e) {
        console.error(`[generate-images] Failed to update post "${post.title}":`, e)
      }
    }

    console.log('[generate-images] Batch complete')
  })

  return NextResponse.json({
    success: true,
    message: `Generating images for ${posts.length} post(s)`,
    titles: posts.map((p) => p.title),
  })
}
