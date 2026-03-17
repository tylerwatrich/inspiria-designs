/**
 * CRON — Image Generator
 *
 * Finds published posts with no heroImageUrl and generates one via BFL Flux.
 * Processes up to 3 posts per run to stay within Vercel function limits.
 *
 * Schedule: Daily, or after write-post runs (e.g. Mon/Wed/Fri at 11am UTC)
 * URL: https://inspiriadigital.com/api/cron/generate-images
 * Header: Authorization: Bearer YOUR_CRON_SECRET
 */

import { NextRequest, NextResponse, after } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { generateArticleImage } from '@/lib/imageGenerator'

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
            { heroImageUrl: { exists: false } },
            { heroImageUrl: { equals: '' } },
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
    for (const post of posts) {
      console.log(`[generate-images] Generating image for "${post.title}" (id: ${post.id})`)

      const imageUrl = await generateArticleImage(post.title, '')

      if (!imageUrl) {
        console.error(`[generate-images] Failed for "${post.title}" — skipping`)
        continue
      }

      try {
        await payload.update({
          collection: 'posts',
          id: post.id,
          data: { heroImageUrl: imageUrl },
        })
        console.log(`[generate-images] Updated "${post.title}" with image`)
      } catch (e) {
        console.error(`[generate-images] Failed to save image URL for "${post.title}":`, e)
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
