import { getPayload } from 'payload'
import config from '@payload-config'
import { UAParser } from 'ua-parser-js'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      visitorId,
      fingerprintId,
      sessionId,
      path,
      title,
      referrer,
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
      utmTerm,
      timeOnPage,
      scrollDepth,
      isNewSession,
    } = body

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

    // Parse user-agent into readable device/browser/OS fields
    const ua = new UAParser(userAgent)
    const uaResult = ua.getResult()
    const deviceType = (uaResult.device.type as 'mobile' | 'tablet') || 'desktop'
    const browser =
      uaResult.browser.name && uaResult.browser.major
        ? `${uaResult.browser.name} ${uaResult.browser.major}`
        : uaResult.browser.name || ''
    const os =
      uaResult.os.name && uaResult.os.version
        ? `${uaResult.os.name} ${uaResult.os.version}`
        : uaResult.os.name || ''

    const newPage = { path, title: title || '', visitedAt: now }

    // --- Identity resolution ---
    // Look up by fingerprint and by UUID simultaneously
    let visitorByFingerprint: any = null
    let visitorByUUID: any = null

    if (fingerprintId) {
      const result = await payload.find({
        collection: 'page-views',
        where: { fingerprintId: { equals: fingerprintId } },
        limit: 1,
        overrideAccess: true,
      })
      visitorByFingerprint = result.docs[0] || null
    }

    if (visitorId) {
      const result = await payload.find({
        collection: 'page-views',
        where: { visitorId: { equals: visitorId } },
        limit: 1,
        overrideAccess: true,
      })
      visitorByUUID = result.docs[0] || null
    }

    let visitor: any = null

    if (visitorByFingerprint && visitorByUUID) {
      if (visitorByFingerprint.id === visitorByUUID.id) {
        // Same record — straightforward update
        visitor = visitorByFingerprint
      } else {
        // Two separate records — merge into the older one, delete the newer
        const fpCreated = new Date(visitorByFingerprint.createdAt as string).getTime()
        const uuidCreated = new Date(visitorByUUID.createdAt as string).getTime()
        const [keep, drop] =
          fpCreated <= uuidCreated
            ? [visitorByFingerprint, visitorByUUID]
            : [visitorByUUID, visitorByFingerprint]

        const mergedPages = [
          ...((keep.pages as any[]) || []),
          ...((drop.pages as any[]) || []),
        ]

        await payload.update({
          collection: 'page-views',
          id: keep.id,
          data: {
            visitorId: visitorId || (keep.visitorId as string),
            fingerprintId: fingerprintId || (keep.fingerprintId as string),
            pageCount: mergedPages.length,
            pages: mergedPages,
          },
          overrideAccess: true,
        })

        await payload.delete({
          collection: 'page-views',
          id: drop.id,
          overrideAccess: true,
        })

        visitor = { ...keep, pages: mergedPages }
      }
    } else if (visitorByFingerprint) {
      // Returning visitor who cleared localStorage — recognize them by fingerprint
      visitor = visitorByFingerprint
    } else if (visitorByUUID) {
      visitor = visitorByUUID
    }

    // Always write a flat visit log entry
    await payload.create({
      collection: 'page-visits',
      data: {
        path,
        title: title || '',
        visitedAt: now,
        visitorId: visitorId || visitor?.visitorId || '',
        sessionId: sessionId || '',
        isNewSession: isNewSession || false,
        timeOnPage: typeof timeOnPage === 'number' ? timeOnPage : undefined,
        scrollDepth: typeof scrollDepth === 'number' ? scrollDepth : undefined,
        referrer: referrer || '',
        utmSource: utmSource || '',
        utmMedium: utmMedium || '',
        utmCampaign: utmCampaign || '',
        utmContent: utmContent || '',
        utmTerm: utmTerm || '',
        ipAddress,
        country,
        city,
        region,
        userAgent,
      },
      overrideAccess: true,
    })

    if (visitor) {
      const updatedPages = [...((visitor.pages as any[]) || []), newPage]

      const updateData: Record<string, any> = {
        ipAddress,
        country,
        city,
        region,
        userAgent,
        pageCount: updatedPages.length,
        lastVisit: now,
        pages: updatedPages,
      }

      // Fill in fingerprint if it was missing (e.g. old record before fingerprinting was added)
      if (fingerprintId && !visitor.fingerprintId) updateData.fingerprintId = fingerprintId
      // Fill in UUID if it was missing (fingerprint-only recovery)
      if (visitorId && !visitor.visitorId) updateData.visitorId = visitorId
      // Fill in device fields if missing
      if (!visitor.deviceType && deviceType) updateData.deviceType = deviceType
      if (!visitor.browser && browser) updateData.browser = browser
      if (!visitor.os && os) updateData.os = os
      // Increment session count on new session
      if (isNewSession) updateData.sessionCount = ((visitor.sessionCount as number) || 0) + 1

      await payload.update({
        collection: 'page-views',
        id: visitor.id,
        data: updateData,
        overrideAccess: true,
      })

      return Response.json({ visitorId: visitor.visitorId || visitorId })
    }

    // Brand new visitor — create their profile
    const newVisitorId = visitorId || crypto.randomUUID()

    let firstSourceDomain = ''
    if (referrer) {
      try {
        firstSourceDomain = new URL(referrer).hostname
      } catch {
        firstSourceDomain = referrer
      }
    }

    await payload.create({
      collection: 'page-views',
      data: {
        visitorId: newVisitorId,
        fingerprintId: fingerprintId || '',
        deviceType,
        browser,
        os,
        ipAddress,
        country,
        city,
        region,
        userAgent,
        pageCount: 1,
        sessionCount: 1,
        lastVisit: now,
        firstSource: firstSourceDomain,
        firstUtmSource: utmSource || '',
        firstUtmMedium: utmMedium || '',
        firstUtmCampaign: utmCampaign || '',
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
