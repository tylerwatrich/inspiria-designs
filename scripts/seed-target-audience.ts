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
    industry: 'Lawyers & Solo Law Firms',
    businessSizes: ['solo', 'micro'],
    notes:
      'Solo practitioners and small firms (1–10 employees). Recently launched practices with strong word-of-mouth but no web presence. Need credibility, lead gen, consultation booking, and mobile-friendly design. Pain point: outdated or absent website not reflecting their work quality.',
    keywords: [
      'law firm website',
      'lawyer website design',
      'legal marketing',
      'law firm lead generation',
      'get more law clients',
      'legal SEO',
      'how to get more clients as a lawyer',
      'best law firm website features',
      'secure client portal for lawyers',
      'how to design a law firm website',
      'convert website visitors to legal clients',
      'all-in-one web design for lawyers',
      'hassle-free website for lawyers',
      'full-service law firm web design',
      'website for busy lawyers',
      'client intake forms for lawyers',
      'mobile-friendly law firm website',
    ],
  },
  {
    industry: 'Real Estate Agents & Small Agencies',
    businessSizes: ['solo', 'micro'],
    notes:
      'Solo agents and boutique agencies relying on personal brand. Need to stand out from big brokerage sites and establish independent authority. Pain point: losing credibility to agents with polished personal sites.',
    keywords: [
      'real estate website',
      'realtor website',
      'real estate marketing',
      'personal branding for realtors',
      'lead generation for real estate agents',
      'how to build a professional real estate website',
      'why realtors need their own website',
      'real estate agent website design',
      'how to get more clients as a realtor',
      'how to generate real estate leads from website',
      'IDX website design for realtors',
      'local real estate content marketing',
      'real estate website for busy agents',
      'build a real estate website without coding',
      'best website for real estate agents',
      'real estate agent website features',
    ],
  },
  {
    industry: 'Therapists & Solo Therapy Practices',
    businessSizes: ['solo', 'micro'],
    notes:
      'Solo therapists and small counseling practices. Trust and warmth are primary purchase drivers — website must create emotional safety before a prospective client books. Pain point: generic or clinical-looking sites that fail to convert anxious first-time therapy seekers.',
    keywords: [
      'therapist website',
      'therapy website design',
      'mental health marketing',
      'professional therapy website',
      'trust-building for therapists',
      'how to build a therapy website',
      'website design for mental health professionals',
      'how to get more therapy clients',
      'creating a welcoming therapy website',
      'online booking system for therapists',
      'client portal for therapy practice',
      'best website for therapists',
      'attract new counseling clients',
      'therapist website features',
    ],
  },
  {
    industry: 'Dentists & Solo Dental Practices',
    businessSizes: ['solo', 'micro'],
    notes:
      'Owner-operated dental offices competing against corporate dental chains. Credibility and before/after visual presentation are key. Pain point: corporate chain sites are professional; solo dentist sites often look dated and lose new patient trust.',
    keywords: [
      'dentist website',
      'dental practice website',
      'dental marketing',
      'dental website design',
      'how to get more dental patients',
      'website design for dentists',
      'dental practice website features',
      'how to attract new dental patients online',
      'online booking for dental practice',
      'best website for dentists Canada',
      'dental SEO for small practices',
    ],
  },
  {
    industry: 'Accountants & Bookkeepers',
    businessSizes: ['solo', 'micro'],
    notes:
      'Solo CPAs, independent bookkeepers, and small accounting firms. Trust and perceived professionalism are everything — clients are handing over financial data. Pain point: generic or template websites that look identical to every other accountant, with no differentiation.',
    keywords: [
      'accountant website',
      'CPA website design',
      'bookkeeper website',
      'accounting firm marketing',
      'website design for accountants',
      'how to get more accounting clients',
      'CPA website features',
      'how to market a small accounting firm',
      'bookkeeper website design Canada',
      'professional accountant website',
      'attract small business clients as accountant',
    ],
  },
  {
    industry: 'Financial Advisors & Independent Planners',
    businessSizes: ['solo', 'micro'],
    notes:
      'Independent financial planners and small advisory practices not affiliated with large banks. High-trust, high-value clients (high net worth individuals). Website must project credibility and expertise to justify premium fees. Pain point: competing against large institution brand recognition without a large firm behind them.',
    keywords: [
      'financial advisor website',
      'financial planner website',
      'wealth management website',
      'financial services web design',
      'website design for financial advisors',
      'how to get more financial planning clients',
      'financial advisor website features',
      'build trust as a financial advisor online',
      'independent financial planner website Canada',
      'how to attract high net worth clients online',
      'financial advisor local SEO',
    ],
  },
  {
    industry: 'Chiropractors & Physiotherapists',
    businessSizes: ['solo', 'micro'],
    notes:
      'Owner-operated chiro and physio clinics competing against multi-location wellness chains. New patients often search by location and read reviews before booking. Website must clearly communicate specialties, show social proof, and make booking frictionless. Pain point: no online booking or an outdated site that loses patients to a competitor who has one.',
    keywords: [
      'chiropractor website',
      'physiotherapy website',
      'wellness clinic website',
      'chiro website design',
      'website design for chiropractors',
      'how to get more chiropractic patients',
      'physiotherapy clinic website features',
      'online booking for chiropractors',
      'best website for physio clinic',
      'chiropractic SEO Canada',
      'how to attract new patients to wellness clinic',
    ],
  },
]

async function seedTargetAudience() {
  const payload = await getPayload({ config })

  console.log('Seeding Target Audience collection...\n')

  let created = 0
  let skipped = 0

  for (const entry of industries) {
    // Check if already exists
    const existing = await payload.find({
      collection: 'target-audience',
      where: { industry: { equals: entry.industry } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      console.log(`⏭  Skipping "${entry.industry}" — already exists`)
      skipped++
      continue
    }

    await payload.create({
      collection: 'target-audience',
      data: {
        industry: entry.industry,
        businessSizes: entry.businessSizes,
        notes: entry.notes,
        keywords: entry.keywords.map((kw) => ({ keyword: kw })),
      },
    })

    console.log(`✓  Created "${entry.industry}" (${entry.keywords.length} keywords)`)
    created++
  }

  console.log(`\n=== Seed Complete ===`)
  console.log(`Created: ${created}`)
  console.log(`Skipped: ${skipped}`)

  process.exit(0)
}

seedTargetAudience().catch((err) => {
  console.error(err)
  process.exit(1)
})
