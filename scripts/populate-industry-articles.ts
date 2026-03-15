import { getPayload } from 'payload'
import config from '@payload-config'
import pg from 'pg'

async function populateIndustryArticles() {
  const payload = await getPayload({ config })

  // Read the post→industry mappings directly from posts_rels
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URI || 'postgresql://tylerwatrich@localhost:5432/inspiria-designs',
  })
  await client.connect()

  const { rows } = await client.query<{ target_audience_id: number; post_id: number }>(`
    SELECT target_audience_id, parent_id AS post_id
    FROM posts_rels
    WHERE path = 'targetIndustry'
    ORDER BY target_audience_id, parent_id
  `)

  await client.end()

  // Group post IDs by industry
  const byIndustry = new Map<number, number[]>()
  for (const row of rows) {
    const list = byIndustry.get(row.target_audience_id) ?? []
    list.push(row.post_id)
    byIndustry.set(row.target_audience_id, list)
  }

  console.log(`Found ${rows.length} post→industry links across ${byIndustry.size} industries\n`)

  let updated = 0
  let failed = 0

  for (const [industryId, postIds] of byIndustry) {
    try {
      const industry = await payload.findByID({
        collection: 'target-audience',
        id: industryId,
      })

      await payload.update({
        collection: 'target-audience',
        id: industryId,
        data: {
          relatedPosts: postIds,
        },
      })

      console.log(`✓  "${industry.industry}" → ${postIds.length} articles [${postIds.join(', ')}]`)
      updated++
    } catch (err) {
      console.error(`✗  Industry ${industryId}:`, (err as Error).message)
      failed++
    }
  }

  // Report industries with no articles
  const allIndustries = await payload.find({ collection: 'target-audience', limit: 100 })
  const tagged = new Set(byIndustry.keys())
  const empty = allIndustries.docs.filter((d) => !tagged.has(d.id as number))
  if (empty.length) {
    console.log(`\n── Industries with no articles (${empty.length}) ──`)
    for (const e of empty) {
      console.log(`   ${e.id}: ${e.industry}`)
    }
  }

  console.log(`\n=== Done ===`)
  console.log(`Updated: ${updated}  Failed: ${failed}`)

  process.exit(0)
}

populateIndustryArticles().catch((err) => {
  console.error(err)
  process.exit(1)
})
