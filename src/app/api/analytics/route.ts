// This proxies GA4 requests through your domain to bypass content blockers

import { NextRequest, NextResponse } from 'next/server'

const GA_ENDPOINT = 'https://www.google-analytics.com'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const url = new URL(request.url)
    const path = url.searchParams.get('path') || '/g/collect'

    // Forward the request to Google Analytics
    const response = await fetch(`${GA_ENDPOINT}${path}?${url.searchParams.toString()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body,
    })

    // Return a successful response
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (error) {
    console.error('Analytics proxy error:', error)
    return new NextResponse(null, { status: 204 }) // Still return 204 to not break tracking
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const path = url.searchParams.get('path') || '/g/collect'

    // Forward GET requests (for pageviews, etc.)
    const response = await fetch(`${GA_ENDPOINT}${path}?${url.searchParams.toString()}`, {
      method: 'GET',
      headers: {
        'User-Agent': request.headers.get('user-agent') || '',
      },
    })

    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('Analytics proxy error:', error)
    return new NextResponse(null, { status: 204 })
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
