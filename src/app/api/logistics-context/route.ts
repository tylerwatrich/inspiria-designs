import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export interface LiveLogisticsNote {
  note: string
  confidence: 'verified' | 'estimated' | 'stale'
  lastReviewed?: string // ISO date string
}

// Shape matches PROVINCE_CONTEXT — drop-in overlay
export type LiveLogisticsContext = Record<string, Record<string, LiveLogisticsNote>>

export async function GET() {
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'logistics-context',
    limit: 200,
    pagination: false,
  })

  const result: LiveLogisticsContext = {}

  for (const doc of docs) {
    const province = doc.province as string
    const market = doc.market as string
    if (!province || !market || !doc.note) continue

    if (!result[province]) result[province] = {}
    result[province][market] = {
      note: doc.note as string,
      confidence: (doc.confidence as LiveLogisticsNote['confidence']) ?? 'estimated',
      lastReviewed: doc.lastReviewed
        ? new Date(doc.lastReviewed as string).toISOString()
        : undefined,
    }
  }

  return NextResponse.json(result, {
    headers: {
      // Cache at the CDN edge for 1 hour — cron only runs monthly so this is safe
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
