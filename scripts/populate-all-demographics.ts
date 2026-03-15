import { getPayload } from 'payload'
import config from '@payload-config'

type BusinessSize = 'solo' | 'micro' | 'small' | 'medium' | 'large'

async function getIndustryIds(payload: Awaited<ReturnType<typeof getPayload>>) {
  const result = await payload.find({
    collection: 'target-audience',
    limit: 100,
  })
  return Object.fromEntries(result.docs.map((d) => [d.industry as string, d.id as number]))
}

async function getArticleTypeIds(payload: Awaited<ReturnType<typeof getPayload>>) {
  const result = await payload.find({
    collection: 'article-types',
    limit: 100,
  })
  return Object.fromEntries(result.docs.map((d) => [d.label as string, d.id as number]))
}

async function populateAll() {
  const payload = await getPayload({ config })

  const IND = await getIndustryIds(payload)
  const TYPE = await getArticleTypeIds(payload)

  console.log('\nLoaded industries:', Object.keys(IND).join(', '))
  console.log('Loaded article types:', Object.keys(TYPE).join(', '))

  // shorthand aliases
  const GENERIC = IND['Generic / All Industries']
  const LAWYERS = IND['Lawyers & Solo Law Firms']
  const REAL_ESTATE = IND['Real Estate Agents & Small Agencies']
  const THERAPISTS = IND['Therapists & Solo Therapy Practices']
  const DENTISTS = IND['Dentists & Solo Dental Practices']
  const ACCOUNTANTS = IND['Accountants & Bookkeepers']
  const FINANCIAL = IND['Financial Advisors & Independent Planners']
  const CHIRO = IND['Chiropractors & Physiotherapists']
  const TRADES = IND['Trades & Construction']
  const CONSULTANTS = IND['Business Consultants']
  const GOV = IND['Government Contractors']
  const HEALTH = IND['Healthcare Professionals']

  const AUTHORITY = TYPE['Authority Builder']
  const PAIN = TYPE['Pain Point']
  const GUIDE = TYPE['Guide / How-To']
  const LISTICLE = TYPE['Listicle']
  const COMPARISON = TYPE['Comparison']
  const SERVICE = TYPE['Service Spotlight']
  const NICHE = TYPE['Niche / Situational']

  const SIZES_SOLO_MICRO: BusinessSize[] = ['solo', 'micro']

  type PostEntry = {
    id: number
    articleType: number
    targetIndustry: number[]
    targetBusinessSize: BusinessSize[]
    primaryKeyword: string
  }

  const posts: PostEntry[] = [
    // ── Generic awareness series (289–299) ─────────────────────────────────────
    {
      id: 289,
      articleType: AUTHORITY,
      targetIndustry: [GENERIC],
      targetBusinessSize: SIZES_SOLO_MICRO,
      primaryKeyword: 'professional website design',
    },
    {
      id: 290,
      articleType: COMPARISON,
      targetIndustry: [GENERIC],
      targetBusinessSize: SIZES_SOLO_MICRO,
      primaryKeyword: 'small business website',
    },
    {
      id: 291,
      articleType: AUTHORITY,
      targetIndustry: [GENERIC],
      targetBusinessSize: SIZES_SOLO_MICRO,
      primaryKeyword: 'web design for professionals',
    },
    {
      id: 292,
      articleType: GUIDE,
      targetIndustry: [GENERIC],
      targetBusinessSize: SIZES_SOLO_MICRO,
      primaryKeyword: 'professional website design',
    },
    {
      id: 293,
      articleType: AUTHORITY,
      targetIndustry: [GENERIC],
      targetBusinessSize: SIZES_SOLO_MICRO,
      primaryKeyword: 'small business website',
    },
    {
      id: 294,
      articleType: AUTHORITY,
      targetIndustry: [GENERIC],
      targetBusinessSize: SIZES_SOLO_MICRO,
      primaryKeyword: 'professional website design',
    },
    {
      id: 295,
      articleType: GUIDE,
      targetIndustry: [GENERIC],
      targetBusinessSize: SIZES_SOLO_MICRO,
      primaryKeyword: 'small business website',
    },
    {
      id: 296,
      articleType: AUTHORITY,
      targetIndustry: [GENERIC],
      targetBusinessSize: SIZES_SOLO_MICRO,
      primaryKeyword: 'web design for professionals',
    },
    {
      id: 297,
      articleType: GUIDE,
      targetIndustry: [GENERIC],
      targetBusinessSize: SIZES_SOLO_MICRO,
      primaryKeyword: 'professional website design',
    },
    {
      id: 298,
      articleType: AUTHORITY,
      targetIndustry: [GENERIC],
      targetBusinessSize: SIZES_SOLO_MICRO,
      primaryKeyword: 'small business website',
    },
    {
      id: 299,
      articleType: AUTHORITY,
      targetIndustry: [GENERIC],
      targetBusinessSize: SIZES_SOLO_MICRO,
      primaryKeyword: 'full-service web design Canada',
    },

    // ── Google Ads (300–301) ────────────────────────────────────────────────────
    {
      id: 300,
      articleType: GUIDE,
      targetIndustry: [GENERIC],
      targetBusinessSize: SIZES_SOLO_MICRO,
      primaryKeyword: 'professional website design',
    },
    {
      id: 301,
      articleType: GUIDE,
      targetIndustry: [GENERIC],
      targetBusinessSize: SIZES_SOLO_MICRO,
      primaryKeyword: 'professional website design',
    },

    // ── Trades & Construction (302–303) ────────────────────────────────────────
    {
      id: 302,
      articleType: AUTHORITY,
      targetIndustry: [TRADES],
      targetBusinessSize: ['solo', 'micro', 'small'],
      primaryKeyword: 'contractor website',
    },
    {
      id: 303,
      articleType: AUTHORITY,
      targetIndustry: [TRADES],
      targetBusinessSize: ['solo', 'micro', 'small'],
      primaryKeyword: 'Canadian steel industry website',
    },

    // ── Therapists (304–305) ───────────────────────────────────────────────────
    {
      id: 304,
      articleType: PAIN,
      targetIndustry: [THERAPISTS],
      targetBusinessSize: SIZES_SOLO_MICRO,
      primaryKeyword: 'how to get more therapy clients',
    },
    {
      id: 305,
      articleType: PAIN,
      targetIndustry: [THERAPISTS],
      targetBusinessSize: SIZES_SOLO_MICRO,
      primaryKeyword: 'best website for therapists',
    },

    // ── Cross-vertical (306–308) ────────────────────────────────────────────────
    {
      id: 306,
      articleType: LISTICLE,
      targetIndustry: [LAWYERS, REAL_ESTATE, THERAPISTS, DENTISTS, ACCOUNTANTS, FINANCIAL, CHIRO],
      targetBusinessSize: SIZES_SOLO_MICRO,
      primaryKeyword: 'signs your website is losing you clients',
    },
    {
      id: 307,
      articleType: PAIN,
      targetIndustry: [LAWYERS, REAL_ESTATE, THERAPISTS, DENTISTS, ACCOUNTANTS, FINANCIAL, CHIRO],
      targetBusinessSize: SIZES_SOLO_MICRO,
      primaryKeyword: 'how to know if your website needs a redesign',
    },
    {
      id: 308,
      articleType: PAIN,
      targetIndustry: [LAWYERS, REAL_ESTATE, THERAPISTS, DENTISTS, ACCOUNTANTS, FINANCIAL, CHIRO],
      targetBusinessSize: SIZES_SOLO_MICRO,
      primaryKeyword: 'website redesign',
    },

    // ── Business Consultants (309–310) ─────────────────────────────────────────
    {
      id: 309,
      articleType: AUTHORITY,
      targetIndustry: [CONSULTANTS],
      targetBusinessSize: SIZES_SOLO_MICRO,
      primaryKeyword: 'business consultant website',
    },
    {
      id: 310,
      articleType: PAIN,
      targetIndustry: [CONSULTANTS],
      targetBusinessSize: SIZES_SOLO_MICRO,
      primaryKeyword: 'how to get more consulting clients',
    },

    // ── Government Contractors (311–314) ───────────────────────────────────────
    {
      id: 311,
      articleType: LISTICLE,
      targetIndustry: [GOV, TRADES],
      targetBusinessSize: ['micro', 'small'],
      primaryKeyword: 'government contractor website Canada',
    },
    {
      id: 312,
      articleType: GUIDE,
      targetIndustry: [GOV, TRADES],
      targetBusinessSize: ['micro', 'small'],
      primaryKeyword: 'how to win government contracts Canada',
    },
    {
      id: 313,
      articleType: GUIDE,
      targetIndustry: [GOV, TRADES],
      targetBusinessSize: ['micro', 'small'],
      primaryKeyword: 'Buy Canadian website',
    },
    {
      id: 314,
      articleType: GUIDE,
      targetIndustry: [GOV],
      targetBusinessSize: ['micro', 'small'],
      primaryKeyword: 'how to win government contracts Canada',
    },

    // ── Lawyers (315–317, 325) ─────────────────────────────────────────────────
    {
      id: 315,
      articleType: AUTHORITY,
      targetIndustry: [LAWYERS],
      targetBusinessSize: SIZES_SOLO_MICRO,
      primaryKeyword: 'law firm website',
    },
    {
      id: 316,
      articleType: GUIDE,
      targetIndustry: [LAWYERS],
      targetBusinessSize: SIZES_SOLO_MICRO,
      primaryKeyword: 'how to get more clients as a lawyer',
    },
    {
      id: 317,
      articleType: SERVICE,
      targetIndustry: [LAWYERS],
      targetBusinessSize: SIZES_SOLO_MICRO,
      primaryKeyword: 'all-in-one web design for lawyers',
    },

    // ── Real Estate (318–320) ──────────────────────────────────────────────────
    {
      id: 318,
      articleType: COMPARISON,
      targetIndustry: [REAL_ESTATE],
      targetBusinessSize: SIZES_SOLO_MICRO,
      primaryKeyword: 'why realtors need their own website',
    },
    {
      id: 319,
      articleType: GUIDE,
      targetIndustry: [REAL_ESTATE],
      targetBusinessSize: SIZES_SOLO_MICRO,
      primaryKeyword: 'how to generate real estate leads from website',
    },
    {
      id: 320,
      articleType: SERVICE,
      targetIndustry: [REAL_ESTATE],
      targetBusinessSize: SIZES_SOLO_MICRO,
      primaryKeyword: 'real estate agent website design',
    },

    // ── Therapists (321) ───────────────────────────────────────────────────────
    {
      id: 321,
      articleType: AUTHORITY,
      targetIndustry: [THERAPISTS],
      targetBusinessSize: SIZES_SOLO_MICRO,
      primaryKeyword: 'website design for mental health professionals',
    },

    // ── Healthcare (322) ───────────────────────────────────────────────────────
    {
      id: 322,
      articleType: NICHE,
      targetIndustry: [HEALTH],
      targetBusinessSize: SIZES_SOLO_MICRO,
      primaryKeyword: 'relocating doctor online portfolio',
    },

    // ── Government Contractors (323–324) ───────────────────────────────────────
    {
      id: 323,
      articleType: LISTICLE,
      targetIndustry: [GOV],
      targetBusinessSize: ['micro', 'small'],
      primaryKeyword: 'government contractor website Canada',
    },
    {
      id: 324,
      articleType: GUIDE,
      targetIndustry: [GOV],
      targetBusinessSize: ['micro', 'small'],
      primaryKeyword: 'AODA compliance website',
    },

    // ── Lawyers (325) ─────────────────────────────────────────────────────────
    {
      id: 325,
      articleType: PAIN,
      targetIndustry: [LAWYERS],
      targetBusinessSize: SIZES_SOLO_MICRO,
      primaryKeyword: 'law firm website',
    },
  ]

  console.log(`\nPopulating ${posts.length} posts...\n`)

  let updated = 0
  let failed = 0

  for (const post of posts) {
    try {
      await payload.update({
        collection: 'posts',
        id: post.id,
        data: {
          articleType: post.articleType,
          targetIndustry: post.targetIndustry,
          targetBusinessSize: post.targetBusinessSize,
          meta: {
            primaryKeyword: post.primaryKeyword,
          },
          _status: 'published',
        },
      })
      console.log(`✓  ${post.id}  type=${post.articleType}  industries=[${post.targetIndustry.join(',')}]  kw="${post.primaryKeyword}"`)
      updated++
    } catch (err) {
      console.error(`✗  Post ${post.id}:`, (err as Error).message)
      failed++
    }
  }

  console.log(`\n=== Done ===`)
  console.log(`Updated: ${updated}  Failed: ${failed}`)

  process.exit(0)
}

populateAll().catch((err) => {
  console.error(err)
  process.exit(1)
})
