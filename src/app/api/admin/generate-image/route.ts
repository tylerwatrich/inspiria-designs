import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { generateArticleImage } from '@/lib/imageGenerator'

export const maxDuration = 120

export async function POST(req: NextRequest) {
  const payload = await getPayload({ config })

  // Must be an authenticated admin user
  const { user } = await payload.auth({ headers: req.headers })
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { postId, vertical } = await req.json()
  if (!postId) {
    return NextResponse.json({ error: 'postId is required' }, { status: 400 })
  }

  const post = await payload.findByID({ collection: 'posts', id: postId })
  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  if (post.heroImageUrl) {
    return NextResponse.json({ error: 'Post already has a hero image URL' }, { status: 409 })
  }

  const imageUrl = await generateArticleImage(post.title, vertical ?? '')
  if (!imageUrl) {
    return NextResponse.json({ error: 'Image generation failed — check server logs' }, { status: 500 })
  }

  await payload.update({
    collection: 'posts',
    id: postId,
    data: { heroImageUrl: imageUrl },
  })

  return NextResponse.json({ success: true, heroImageUrl: imageUrl })
}
