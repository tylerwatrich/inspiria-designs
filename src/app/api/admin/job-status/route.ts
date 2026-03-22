/**
 * Returns the latest job-run record for each job type.
 * Used by AIControlPanel to poll run state across refreshes and tab switches.
 */

import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

const JOB_TYPES = ['scan-news', 'write-post', 'generate-images', 'quality-audit', 'update-articles'] as const

export async function GET() {
  const payload = await getPayload({ config })

  const results = await Promise.all(
    JOB_TYPES.map(async (jobType) => {
      const { docs } = await payload.find({
        collection: 'job-runs',
        where: { jobType: { equals: jobType } },
        sort: '-startedAt',
        limit: 1,
      })
      const latest = docs[0] ?? null
      return [
        jobType,
        latest
          ? {
              status: latest.status as 'running' | 'completed' | 'error',
              startedAt: latest.startedAt as string,
              completedAt: (latest.completedAt as string) ?? null,
              message: (latest.message as string) ?? '',
            }
          : null,
      ] as const
    })
  )

  return NextResponse.json(Object.fromEntries(results))
}
