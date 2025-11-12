import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const url = new URL(request.url)

    // Get the path (e.g., /api/analytics/g/collect -> /g/collect)
    const pathname = url.pathname.replace('/api/analytics', '')

    // Get all query parameters
    const searchParams = url.searchParams.toString()

    // Forward to Google Analytics with the correct path
    const gaUrl = `https://www.google-analytics.com${pathname}?${searchParams}`

    console.log('Forwarding POST to:', gaUrl)

    await fetch(gaUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: body,
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

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)

    // Get the path
    const pathname = url.pathname.replace('/api/analytics', '')
    const searchParams = url.searchParams.toString()

    const gaUrl = `https://www.google-analytics.com${pathname}?${searchParams}`

    console.log('Forwarding GET to:', gaUrl)

    await fetch(gaUrl, {
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

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
