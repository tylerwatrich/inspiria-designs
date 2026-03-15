import { getPayload } from 'payload'
import config from '@payload-config'

type BusinessSize = 'solo' | 'micro' | 'small' | 'medium' | 'large'

const industries: Array<{
  industry: string
  businessSizes: BusinessSize[]
  notes: string
  keywords: string[]
}> = [
  {
    industry: 'Nuclear',
    businessSizes: ['small', 'medium'],
    notes:
      'Canadian nuclear sector — suppliers, engineering firms, and consultancies serving AECL, Bruce Power, OPG, and Cameco. Credibility, safety culture, and regulatory compliance must be front and centre. Pain point: highly technical organizations with outdated or generic websites that fail to convey their expertise to procurement officers and partners.',
    keywords: [
      'nuclear industry website Canada',
      'nuclear supplier website',
      'nuclear engineering firm web design',
      'AECL supplier website',
      'Bruce Power vendor website',
      'OPG contractor web design',
      'nuclear sector digital presence',
      'nuclear consulting firm website',
      'CANDU supplier website',
      'nuclear procurement website Canada',
      'nuclear safety compliance website',
      'Cameco supplier web design',
    ],
  },
  {
    industry: 'AI & Cloud Technology',
    businessSizes: ['solo', 'micro', 'small'],
    notes:
      'AI consultancies, cloud service providers, and SaaS startups — often technically strong but underinvested in their web presence. Clients evaluate credibility heavily online before engaging. Pain point: dev-built or template websites that look unpolished next to the premium service being sold.',
    keywords: [
      'AI company website',
      'cloud technology website design',
      'SaaS company website',
      'AI consulting website Canada',
      'machine learning company web design',
      'tech startup website design',
      'AI services website',
      'cloud solutions provider website',
      'software company website design Canada',
      'AI consultant website',
      'tech company web design',
      'digital transformation company website',
    ],
  },
  {
    industry: 'Military & Defence',
    businessSizes: ['small', 'medium'],
    notes:
      'Canadian defence contractors and DND suppliers — companies supplying equipment, technology, or services to the Canadian Armed Forces and allied procurement programs. Similar to government contractors but with higher trust and security credibility requirements. Pain point: generic corporate websites that fail to signal the required security posture and technical capability to defence procurement officers.',
    keywords: [
      'defence contractor website Canada',
      'DND supplier website',
      'Canadian Armed Forces contractor web design',
      'military supplier website Canada',
      'defence procurement website',
      'PSPC defence vendor website',
      'defence industry digital presence Canada',
      'security clearance contractor website',
      'Canadian defence sector web design',
      'military technology company website',
      'NATO supplier website Canada',
    ],
  },
  {
    industry: 'Finance & Insurance',
    businessSizes: ['solo', 'micro', 'small'],
    notes:
      'Independent mortgage brokers, insurance brokers, fintech founders, and boutique finance firms. Trust is the primary conversion driver — clients are handing over sensitive financial decisions. Pain point: competing against large institutional brand recognition without the brand budget of a bank or national insurer.',
    keywords: [
      'mortgage broker website Canada',
      'insurance broker website',
      'fintech company website',
      'finance company web design Canada',
      'independent mortgage broker website',
      'insurance agency website design',
      'financial services website Canada',
      'fintech startup website',
      'mortgage agent website Ontario',
      'insurance broker web design Canada',
      'finance firm website design',
      'credit union website design',
    ],
  },
  {
    industry: 'Construction Technology',
    businessSizes: ['micro', 'small'],
    notes:
      'PropTech and ConTech companies — software vendors, SaaS platforms, and tech consultancies serving the construction and real estate development industry. Distinct from trades (the builders) — this is the tech layer on top. Pain point: B2B tech companies selling to a traditionally offline industry, needing websites that translate complex software value into clear ROI for non-technical construction decision-makers.',
    keywords: [
      'construction technology company website',
      'construction software website Canada',
      'PropTech website design',
      'ConTech company website',
      'construction management software website',
      'building technology company web design',
      'construction SaaS website',
      'construction project management tool website',
      'real estate technology website Canada',
      'construction tech startup website',
      'digital construction company website',
    ],
  },
]

async function seedIndustriesBatch2() {
  const payload = await getPayload({ config })

  console.log('Seeding industries (batch 2)...\n')

  let created = 0
  let skipped = 0

  for (const entry of industries) {
    const existing = await payload.find({
      collection: 'target-audience',
      where: { industry: { equals: entry.industry } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      console.log(`⏭  Skipping "${entry.industry}" — already exists (ID: ${existing.docs[0].id})`)
      skipped++
      continue
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const record = await (payload.create as any)({
      collection: 'target-audience',
      data: {
        industry: entry.industry,
        businessSizes: entry.businessSizes,
        notes: entry.notes,
        keywords: entry.keywords.map((kw) => ({ keyword: kw })),
      },
    })

    console.log(`✓  Created "${entry.industry}" → ID: ${record.id} (${entry.keywords.length} keywords)`)
    created++
  }

  console.log(`\n=== Done ===`)
  console.log(`Created: ${created}  Skipped: ${skipped}`)

  process.exit(0)
}

seedIndustriesBatch2().catch((err) => {
  console.error(err)
  process.exit(1)
})
