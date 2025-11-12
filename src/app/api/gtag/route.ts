import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return new NextResponse('Missing id parameter', { status: 400 })
    }

    // Fetch the gtag.js script from Google
    const response = await fetch(`https://www.googletagmanager.com/gtag/js?id=${id}`, {
      headers: {
        'User-Agent': request.headers.get('user-agent') || '',
      },
    })

    let script = await response.text()

    // Replace Google Analytics collection URLs with our proxy
    // The gtag script uses these exact patterns

    // Replace the main collection endpoint (with quotes - as it appears in the script)
    script = script.replace(
      /"https:\/\/www\.google-analytics\.com\/g\/collect"/g,
      '"https://" + window.location.host + "/api/analytics/g/collect"',
    )

    // Also handle variations without quotes
    script = script.replace(
      /https:\/\/www\.google-analytics\.com\/g\/collect/g,
      'https://" + window.location.host + "/api/analytics/g/collect',
    )

    // Handle j/collect endpoint
    script = script.replace(
      /"https:\/\/www\.google-analytics\.com\/j\/collect"/g,
      '"https://" + window.location.host + "/api/analytics/j/collect"',
    )

    script = script.replace(
      /https:\/\/www\.google-analytics\.com\/j\/collect/g,
      'https://" + window.location.host + "/api/analytics/j/collect',
    )

    console.log('Script rewritten for proxy')

    return new NextResponse(script, {
      status: 200,
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('Gtag proxy error:', error)
    return new NextResponse('Error loading script', { status: 500 })
  }
}
