/**
 * Scrapes meta title + description from each live post on inspiriadesigns.com
 * and patches them into Payload via the REST API.
 *
 * Run: node scripts/assign-meta.mjs
 * (Dev server must be running on localhost:3000)
 */

import fs from 'fs'

const BASE_URL = 'http://localhost:3000'
const LIVE_BASE = 'https://inspiriadesigns.com'
const EMAIL = 'tyler.watrich@me.com'
const PASSWORD = process.env.PAYLOAD_ADMIN_PASSWORD || 'REDACTED_PAYLOAD_PASSWORD'

const slugs = [
  'the-enduring-value-of-websites-why-every-business-needs-an-online-presence',
  'websites-vs-social-media-why-a-business-website-still-matters',
  'boosting-brand-credibility-how-a-business-website-sets-you-apart-from-competitors',
  'the-seo-advantage-how-a-business-website-can-improve-your-online-visibility',
  'data-ownership-and-control-why-businesses-should-prioritize-their-websites',
  '24-7-accessibility-how-a-website-can-serve-customers-around-the-clock',
  'online-sales-and-e-commerce-maximizing-revenue-through-your-business-website',
  'building-trust-and-customer-relationships-the-role-of-a-business-website',
  'analytics-and-insights-how-a-website-helps-businesses-make-informed-decisions',
  'future-proofing-your-business-why-a-website-is-an-essential-investment-in-the-digital-age',
  'unlocking-digital-success-the-power-of-your-business-website-in-the-social-media-era',
  'unveiling-the-dynamics-of-google-ads-a-comprehensive-exploration-of-functionality-and-significance',
  'mastering-google-ads-a-strategic-guide-to-keyword-usage',
  'building-bridges-booking-jobs-how-your-trade-companys-website-can-drive-growth',
  'seizing-the-steel-boom-your-digital-presence-is-the-gateway-to-a-new-era-for-canadian-steel',
  'why-business-management-consultants-cant-afford-to-skip-a-website',
  'consultants-is-your-website-working-hard-enough-for-you',
  '5-must-haves-for-a-canadian-suppliers-website-to-win-government-contracts',
  'seo-for-canadian-construction-how-to-get-noticed-by-federal-procurement-officers',
  'showcasing-your-canadian-supply-chain-a-web-strategy-for-buy-canadian-compliance',
  'how-an-interactive-portfolio-can-help-you-stand-out-in-a-federal-bid-to-buy-canadian',
  'how-a-modern-law-firm-website-builds-authority-and-credibility',
  'convert-visitors-into-clients-the-essential-guide-to-law-firm-website-design',
  'the-all-in-one-solution-for-your-law-firm-website',
  'ditch-zillow-how-your-own-website-makes-you-a-real-estate-authority',
  'from-clicks-to-closings-designing-a-real-estate-website-that-generates-leads',
  'your-full-service-partner-for-a-high-performance-real-estate-website',
  'the-first-impression-why-your-therapy-website-needs-to-build-trust',
  'relocating-to-canada-as-a-doctor-why-your-online-portfolio-is-your-secret-weapon',
  '5-website-features-every-government-contractor-needs',
  'aoda-wcag-compliance-your-key-to-winning-government-contracts',
]

function extractMeta(html) {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  const ogTitleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i)

  const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i)
  const ogDescMatch = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i)

  const rawTitle = ogTitleMatch?.[1] || titleMatch?.[1] || ''
  // Strip " - Inspiria Designs" or "| Inspiria Designs" suffixes
  const metaTitle = rawTitle.replace(/\s*[-|]\s*Inspiria Designs\s*$/i, '').trim()
  const metaDescription = (descMatch?.[1] || ogDescMatch?.[1] || '').trim()

  return { metaTitle, metaDescription }
}

async function login() {
  const res = await fetch(`${BASE_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  })
  const data = await res.json()
  if (!data.token) { console.error('Login failed:', data); process.exit(1) }
  console.log('✅ Logged in')
  return data.token
}

async function findPost(token, slug) {
  const res = await fetch(`${BASE_URL}/api/posts?where[slug][equals]=${encodeURIComponent(slug)}&limit=1&depth=0`, {
    headers: { Authorization: `JWT ${token}` },
  })
  const data = await res.json()
  return data.docs?.[0] || null
}

async function patchMeta(token, postId, metaTitle, metaDescription) {
  const res = await fetch(`${BASE_URL}/api/posts/${postId}`, {
    method: 'PATCH',
    headers: { Authorization: `JWT ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ meta: { title: metaTitle, description: metaDescription } }),
  })
  const data = await res.json()
  if (!data.doc?.id) throw new Error(JSON.stringify(data.errors || data))
  return data.doc
}

async function patchMetaSQL(postId, metaTitle, metaDescription) {
  // Fallback: write to a SQL file for manual apply
  const escaped = (s) => s.replace(/'/g, "''")
  return `UPDATE posts SET meta_title = '${escaped(metaTitle)}', meta_description = '${escaped(metaDescription)}' WHERE id = ${postId};`
}

async function main() {
  const token = await login()
  let ok = 0, failed = 0
  const sqlFallback = []

  for (const slug of slugs) {
    try {
      process.stdout.write(`🔍 ${slug.slice(0, 55)}... `)

      const liveRes = await fetch(`${LIVE_BASE}/${slug}/`, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      })
      if (!liveRes.ok) throw new Error(`Live site ${liveRes.status}`)
      const html = await liveRes.text()
      const { metaTitle, metaDescription } = extractMeta(html)

      if (!metaTitle && !metaDescription) {
        console.log('⚠️  no meta found')
        continue
      }

      const post = await findPost(token, slug)
      if (!post) {
        console.log('⚠️  post not in Payload')
        continue
      }

      try {
        await patchMeta(token, post.id, metaTitle, metaDescription)
        console.log(`✅  (id ${post.id})`)
        ok++
      } catch (patchErr) {
        // REST PATCH failed — queue for direct SQL
        const sql = await patchMetaSQL(post.id, metaTitle, metaDescription)
        sqlFallback.push(sql)
        console.log(`⚠️  PATCH failed, queued for SQL`)
        failed++
      }
    } catch (err) {
      console.error(`❌  ${err.message}`)
      failed++
    }
  }

  if (sqlFallback.length) {
    const sqlFile = 'scripts/assign-meta-fallback.sql'
    fs.writeFileSync(sqlFile, sqlFallback.join('\n') + '\n')
    console.log(`\n⚠️  ${sqlFallback.length} posts need SQL fallback → ${sqlFile}`)
    console.log(`   Run: psql postgresql://tylerwatrich@localhost:5432/inspiria-designs < ${sqlFile}`)
  }

  console.log(`\nDone — ${ok} updated, ${failed} failed`)
}

main()
