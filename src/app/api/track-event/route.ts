import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { eventType, eventName, properties, visitorId, fingerprintId, sessionId, path, occurredAt } =
      body

    if (!eventType || !eventName) {
      return Response.json({ error: 'eventType and eventName are required' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    await payload.create({
      collection: 'tracking-events',
      data: {
        eventType,
        eventName,
        properties: properties ? JSON.stringify(properties) : '',
        visitorId: visitorId || '',
        fingerprintId: fingerprintId || '',
        sessionId: sessionId || '',
        path: path || '',
        occurredAt: occurredAt || new Date().toISOString(),
      },
      overrideAccess: true,
    })

    return Response.json({ ok: true })
  } catch (err) {
    // Never crash the site over tracking
    console.error('[track-event] error:', err)
    return Response.json({ error: 'event tracking failed' }, { status: 500 })
  }
}
