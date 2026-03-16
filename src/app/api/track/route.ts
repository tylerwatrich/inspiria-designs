import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { visitorId, path, title } = body

    if (!path) {
      return Response.json({ error: 'path is required' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    // Extract IP — Vercel forwards the real IP via x-forwarded-for
    const forwarded = req.headers.get('x-forwarded-for')
    const ipAddress = forwarded ? forwarded.split(',')[0].trim() : 'unknown'

    // Vercel edge network automatically adds these headers
    const country = req.headers.get('x-vercel-ip-country') || ''
    const city = req.headers.get('x-vercel-ip-city') || ''
    const region = req.headers.get('x-vercel-ip-country-region') || ''
    const userAgent = req.headers.get('user-agent') || ''

    const now = new Date().toISOString()

    const newPage = {
      path,
      title: title || '',
      visitedAt: now,
    }

    // Always write a flat visit log entry
    await payload.create({
      collection: 'page-visits',
      data: {
        path,
        title: title || '',
        visitedAt: now,
        visitorId: visitorId || '',
        ipAddress,
        country,
        city,
        region,
        userAgent,
      },
      overrideAccess: true,
    })

    // If we have a visitorId, try to find and update the existing record
    if (visitorId) {
      const existing = await payload.find({
        collection: 'page-views',
        where: { visitorId: { equals: visitorId } },
        limit: 1,
        overrideAccess: true,
      })

      if (existing.docs.length > 0) {
        const visitor = existing.docs[0]
        const updatedPages = [...((visitor.pages as any[]) || []), newPage]

        await payload.update({
          collection: 'page-views',
          id: visitor.id,
          data: {
            ipAddress,
            country,
            city,
            region,
            pageCount: updatedPages.length,
            lastVisit: new Date().toISOString(),
            pages: updatedPages,
          },
          overrideAccess: true,
        })

        return Response.json({ visitorId })
      }
    }

    // New visitor — generate an ID and create the record
    const newVisitorId = visitorId || crypto.randomUUID()

    await payload.create({
      collection: 'page-views',
      data: {
        visitorId: newVisitorId,
        ipAddress,
        country,
        city,
        region,
        userAgent,
        pageCount: 1,
        lastVisit: new Date().toISOString(),
        pages: [newPage],
      },
      overrideAccess: true,
    })

    return Response.json({ visitorId: newVisitorId })
  } catch (err) {
    // Never crash the site over tracking
    console.error('[track] error:', err)
    return Response.json({ error: 'tracking failed' }, { status: 500 })
  }
}
