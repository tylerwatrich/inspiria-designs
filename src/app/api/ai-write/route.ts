import { NextRequest, NextResponse } from 'next/server'
import { generateArticle } from '@/lib/aiWriter'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const article = await generateArticle(body.topic)
    return NextResponse.json({ success: true, article })
  } catch (err) {
    console.error('[ai-write]', err)
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
