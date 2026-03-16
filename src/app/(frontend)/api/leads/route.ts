import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { Resend } from 'resend'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, source } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    await payload.create({
      collection: 'leads',
      data: { name, email, source },
    })

    const apiKey = process.env.RESEND_API_KEY
    const notificationEmail = process.env.NOTIFICATION_EMAIL

    if (apiKey && notificationEmail) {
      const resend = new Resend(apiKey)
      await resend.emails.send({
        from: 'Inspiria Designs <noreply@inspiriadesigns.com>',
        to: notificationEmail,
        subject: `New lead: ${name || email}`,
        text: `New lead submitted via ${source}.\n\nName: ${name || '(not provided)'}\nEmail: ${email}\nSource: ${source}`,
      })
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    console.error('[leads/route] error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
