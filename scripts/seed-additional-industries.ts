import { getPayload } from 'payload'
import config from '@payload-config'

type BusinessSize = 'solo' | 'micro' | 'small' | 'medium' | 'large'

const additionalIndustries: Array<{
  industry: string
  businessSizes: BusinessSize[]
  notes: string
  keywords: string[]
}> = [
  {
    industry: 'Generic / All Industries',
    businessSizes: ['solo', 'micro'],
    notes:
      'Cross-vertical content that applies to any solo professional or small business. Used for awareness-stage posts about websites, credibility, and online presence that are not written for a specific industry.',
    keywords: [
      'professional website design',
      'small business website',
      'website redesign',
      'web design for professionals',
      'how to know if your website needs a redesign',
      'should I redesign my website',
      'how to fix my website',
      'website designers for small businesses',
      'signs your website is losing you clients',
      'full-service web design Canada',
      'affordable web design for small businesses Canada',
    ],
  },
  {
    industry: 'Trades & Construction',
    businessSizes: ['solo', 'micro', 'small'],
    notes:
      'Owner-operators in skilled trades — electricians, plumbers, HVAC, general contractors, steel fabricators. Often rely entirely on word-of-mouth with no web presence. Pain point: no way for leads to find or vet them online, losing bids to competitors with professional websites.',
    keywords: [
      'trades website',
      'contractor website',
      'construction company website',
      'web design for contractors',
      'how to get more construction clients',
      'website for tradespeople Canada',
      'building trades digital presence',
      'HVAC company website',
      'plumber website design',
      'electrician website Canada',
      'Canadian steel industry website',
      'construction company online presence',
    ],
  },
  {
    industry: 'Business Consultants',
    businessSizes: ['solo', 'micro'],
    notes:
      'Independent business and management consultants selling expertise and advisory services. Credibility is everything — clients need to trust the consultant before engaging. Pain point: generic-looking website that fails to convey the depth of their experience.',
    keywords: [
      'business consultant website',
      'management consultant web design',
      'consultant website design Canada',
      'how to get more consulting clients',
      'professional consultant website',
      'business advisor website',
      'consulting firm website features',
      'how to market yourself as a consultant',
      'consultant credibility online',
      'build authority as a business consultant',
    ],
  },
  {
    industry: 'Government Contractors',
    businessSizes: ['micro', 'small'],
    notes:
      'Canadian businesses pursuing federal or provincial government contracts. Procurement officers evaluate vendor websites for legitimacy, AODA/WCAG accessibility compliance, and demonstrated capability. Pain point: missing the compliance signals and portfolio presentation that procurement requires.',
    keywords: [
      'government contractor website Canada',
      'AODA compliance website',
      'WCAG accessible website',
      'Buy Canadian website',
      'federal procurement website',
      'Canadian supplier website',
      'government vendor web design',
      'how to win government contracts Canada',
      'PSPC supplier registration',
      'Canadian supply chain website',
      'web design for government suppliers',
    ],
  },
  {
    industry: 'Healthcare Professionals',
    businessSizes: ['solo', 'micro'],
    notes:
      'Doctors, specialists, and other regulated healthcare professionals building or relocating an independent practice. Need to establish credentials online quickly. Pain point: trust and credential display are critical but most template sites fail to present them compellingly.',
    keywords: [
      'doctor website Canada',
      'physician website design',
      'healthcare professional website',
      'medical practice website',
      'relocating doctor online portfolio',
      'specialist clinic website Canada',
      'how to attract patients as a new doctor',
      'independent physician website features',
      'healthcare provider web design',
    ],
  },
]

async function seedAdditionalIndustries() {
  const payload = await getPayload({ config })

  console.log('Seeding additional industries...\n')

  let created = 0
  let skipped = 0

  for (const entry of additionalIndustries) {
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

seedAdditionalIndustries().catch((err) => {
  console.error(err)
  process.exit(1)
})
