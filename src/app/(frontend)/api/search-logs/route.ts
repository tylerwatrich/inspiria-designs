import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { industry, province, hideUS } = body

    if (!industry) {
      return NextResponse.json({ error: 'industry is required.' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    await payload.create({
      collection: 'search-logs',
      data: {
        industry,
        province: province && province !== 'null_all' ? province : undefined,
        hideUS: Boolean(hideUS),
      },
    })

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    console.error('[search-logs/route] error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
