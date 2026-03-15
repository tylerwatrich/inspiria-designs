import { getPayload } from 'payload'
import config from '@payload-config'

type BusinessSize = 'solo' | 'micro' | 'small' | 'medium' | 'large'

// Target Audience IDs (from seed — confirmed in DB)
const INDUSTRY = {
  LAWYERS: 1,
  REAL_ESTATE: 2,
  THERAPISTS: 3,
  DENTISTS: 4,
  ACCOUNTANTS: 5,
  FINANCIAL_ADVISORS: 6,
  CHIROPRACTORS: 7,
}

const SIZES: BusinessSize[] = ['solo', 'micro']

const postDemographics: Array<{
  id: number
  targetIndustry: number[]
  targetBusinessSize: BusinessSize[]
  primaryKeyword: string
}> = [
  // ── Lawyers ────────────────────────────────────────────────────────────────
  {
    id: 315,
    targetIndustry: [INDUSTRY.LAWYERS],
    targetBusinessSize: SIZES,
    primaryKeyword: 'law firm website',
  },
  {
    id: 316,
    targetIndustry: [INDUSTRY.LAWYERS],
    targetBusinessSize: SIZES,
    primaryKeyword: 'how to get more clients as a lawyer',
  },
  {
    id: 317,
    targetIndustry: [INDUSTRY.LAWYERS],
    targetBusinessSize: SIZES,
    primaryKeyword: 'all-in-one web design for lawyers',
  },
  {
    id: 325,
    targetIndustry: [INDUSTRY.LAWYERS],
    targetBusinessSize: SIZES,
    primaryKeyword: 'law firm website',
  },

  // ── Real Estate ─────────────────────────────────────────────────────────────
  {
    id: 318,
    targetIndustry: [INDUSTRY.REAL_ESTATE],
    targetBusinessSize: SIZES,
    primaryKeyword: 'why realtors need their own website',
  },
  {
    id: 319,
    targetIndustry: [INDUSTRY.REAL_ESTATE],
    targetBusinessSize: SIZES,
    primaryKeyword: 'how to generate real estate leads from website',
  },
  {
    id: 320,
    targetIndustry: [INDUSTRY.REAL_ESTATE],
    targetBusinessSize: SIZES,
    primaryKeyword: 'real estate agent website design',
  },

  // ── Therapists ──────────────────────────────────────────────────────────────
  {
    id: 304,
    targetIndustry: [INDUSTRY.THERAPISTS],
    targetBusinessSize: SIZES,
    primaryKeyword: 'how to get more therapy clients',
  },
  {
    id: 305,
    targetIndustry: [INDUSTRY.THERAPISTS],
    targetBusinessSize: SIZES,
    primaryKeyword: 'best website for therapists',
  },
  {
    id: 321,
    targetIndustry: [INDUSTRY.THERAPISTS],
    targetBusinessSize: SIZES,
    primaryKeyword: 'website design for mental health professionals',
  },
]

// Posts that exist but don't match any of the 7 target industries
const UNMATCHED = [
  { id: 289, reason: 'Generic — "why every business needs a website"' },
  { id: 290, reason: 'Generic — websites vs social media' },
  { id: 291, reason: 'Generic — brand credibility' },
  { id: 292, reason: 'Generic — SEO advantage' },
  { id: 293, reason: 'Generic — data ownership' },
  { id: 294, reason: 'Generic — 24/7 accessibility' },
  { id: 295, reason: 'Generic — e-commerce' },
  { id: 296, reason: 'Generic — trust and relationships' },
  { id: 297, reason: 'Generic — analytics and insights' },
  { id: 298, reason: 'Generic — future-proofing' },
  { id: 299, reason: 'Generic — digital success' },
  { id: 300, reason: 'Off-vertical — Google Ads explainer' },
  { id: 301, reason: 'Off-vertical — Google Ads keywords' },
  { id: 302, reason: 'Off-vertical — trades/construction' },
  { id: 303, reason: 'Off-vertical — Canadian steel industry' },
  { id: 306, reason: 'Cross-vertical — signs website is driving clients away' },
  { id: 307, reason: 'Cross-vertical — hidden cost of outdated website' },
  { id: 308, reason: 'Cross-vertical — stress-free website redesign' },
  { id: 309, reason: 'Off-vertical — business/management consultants' },
  { id: 310, reason: 'Off-vertical — consultants' },
  { id: 311, reason: 'Off-vertical — government contractors' },
  { id: 312, reason: 'Off-vertical — Canadian construction/procurement' },
  { id: 313, reason: 'Off-vertical — Canadian supply chain' },
  { id: 314, reason: 'Off-vertical — federal bid/Buy Canadian' },
  { id: 322, reason: 'Off-vertical — doctors relocating to Canada' },
  { id: 323, reason: 'Off-vertical — government contractor features' },
  { id: 324, reason: 'Off-vertical — AODA/WCAG government compliance' },
]

async function populatePostDemographics() {
  const payload = await getPayload({ config })

  console.log('Populating post demographics...\n')

  let updated = 0
  let failed = 0

  for (const entry of postDemographics) {
    try {
      await payload.update({
        collection: 'posts',
        id: entry.id,
        data: {
          targetIndustry: entry.targetIndustry,
          targetBusinessSize: entry.targetBusinessSize,
          meta: {
            primaryKeyword: entry.primaryKeyword,
          },
          _status: 'published',
        },
      })
      console.log(`✓  Post ${entry.id} → industry ${entry.targetIndustry} | "${entry.primaryKeyword}"`)
      updated++
    } catch (err) {
      console.error(`✗  Post ${entry.id} failed:`, (err as Error).message)
      failed++
    }
  }

  console.log(`\n=== Done ===`)
  console.log(`Updated: ${updated}`)
  console.log(`Failed:  ${failed}`)

  console.log(`\n── Posts with no matching industry (${UNMATCHED.length}) ──`)
  for (const u of UNMATCHED) {
    console.log(`   ${u.id}: ${u.reason}`)
  }

  process.exit(0)
}

populatePostDemographics().catch((err) => {
  console.error(err)
  process.exit(1)
})
