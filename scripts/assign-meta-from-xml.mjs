/**
 * Parses wordpress-export.xml, extracts post titles + first-paragraph descriptions,
 * then writes them directly to the Postgres DB.
 *
 * Run: node scripts/assign-meta-from-xml.mjs
 */

import fs from 'fs'
import { execSync } from 'child_process'

const XML_PATH = 'wordpress-export.xml'
const DB = 'postgresql://tylerwatrich@localhost:5432/inspiria-designs'

const xml = fs.readFileSync(XML_PATH, 'utf8')

// Split into <item> blocks
const items = xml.split(/<item>/).slice(1)

function cdata(str) {
  const m = str.match(/<!\[CDATA\[([\s\S]*?)\]\]>/)
  return m ? m[1].trim() : str.trim()
}

function firstParagraph(html) {
  // Try to get content of first <p> tag
  const m = html.match(/<p[^>]*>([\s\S]+?)<\/p>/i)
  if (!m) return ''
  // Strip any remaining HTML tags
  const text = m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
  // Trim to 160 chars at a word boundary
  if (text.length <= 160) return text
  return text.slice(0, 157).replace(/\s\S+$/, '') + '...'
}

function escSql(s) {
  return s.replace(/'/g, "''")
}

const targetSlugs = new Set([
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
])

const sqlStatements = []

for (const item of items) {
  const slugMatch = item.match(/<wp:post_name>([\s\S]*?)<\/wp:post_name>/)
  const slug = slugMatch ? cdata(slugMatch[1]) : ''
  if (!slug || !targetSlugs.has(slug)) continue

  const titleMatch = item.match(/<title>([\s\S]*?)<\/title>/)
  const title = titleMatch ? cdata(titleMatch[1]) : ''

  const contentMatch = item.match(/<content:encoded>([\s\S]*?)<\/content:encoded>/)
  const rawContent = contentMatch ? cdata(contentMatch[1]) : ''
  const description = firstParagraph(rawContent)

  console.log(`📝 ${slug.slice(0, 60)}`)
  console.log(`   title: ${title.slice(0, 70)}`)
  console.log(`   desc:  ${description.slice(0, 80)}`)

  sqlStatements.push(
    `UPDATE posts SET meta_title = '${escSql(title)}', meta_description = '${escSql(description)}' WHERE slug = '${escSql(slug)}';`
  )
}

console.log(`\nFound ${sqlStatements.length} posts. Applying SQL...\n`)

const sql = sqlStatements.join('\n')
const tmpFile = '/tmp/assign-meta.sql'
fs.writeFileSync(tmpFile, sql)

try {
  const result = execSync(`psql ${DB} < ${tmpFile}`, { encoding: 'utf8' })
  console.log(result)
  console.log(`✅ Done — ${sqlStatements.length} posts updated`)
} catch (err) {
  console.error('SQL failed:', err.message)
  console.log(`SQL saved to ${tmpFile} — run manually:`)
  console.log(`  psql ${DB} < ${tmpFile}`)
}
