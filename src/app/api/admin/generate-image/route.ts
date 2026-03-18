import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { generateArticleImage, saveImageToMedia } from '@/lib/imageGenerator'

export const maxDuration = 120

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config })

    const { postId, vertical } = await req.json()
    if (!postId) {
      return NextResponse.json({ error: 'postId is required' }, { status: 400 })
    }

    const post = await payload.findByID({ collection: 'posts', id: postId })
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    if (post.heroImage) {
      return NextResponse.json({ error: 'Post already has a hero image' }, { status: 409 })
    }

    const bflUrl = await generateArticleImage(post.title, vertical ?? '')
    if (!bflUrl) {
      return NextResponse.json(
        { error: 'Image generation failed — check server logs' },
        { status: 500 },
      )
    }

    const mediaId = await saveImageToMedia(bflUrl, post.title, payload)
    if (!mediaId) {
      return NextResponse.json(
        { error: 'Image generated but failed to save to media — check server logs' },
        { status: 500 },
      )
    }

    await payload.update({
      collection: 'posts',
      id: postId,
      data: { heroImage: mediaId },
    })

    return NextResponse.json({ success: true, mediaId })
  } catch (e: any) {
    console.error('[generate-image] Unhandled error:', e)
    return NextResponse.json({ error: e?.message ?? 'Internal server error' }, { status: 500 })
  }
}
