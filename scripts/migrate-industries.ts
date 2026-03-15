/**
 * Creates an Industry record for each existing Target Audience entry,
 * then links each Target Audience record to its Industry via industryRef.
 *
 * Uses direct SQL for Industry inserts to bypass the afterChange hook
 * (which would try to auto-create TA records that already exist).
 * Safe to re-run — skips Industries that already exist by name.
 */
import { getPayload } from 'payload'
import config from '@payload-config'
import pg from 'pg'

async function migrateIndustries() {
  const payload = await getPayload({ config })

  // Direct DB client — bypasses Payload hooks for Industry inserts
  const client = new pg.Client({
    connectionString:
      process.env.DATABASE_URI ||
      'postgresql://tylerwatrich@localhost:5432/inspiria-designs',
  })
  await client.connect()

  // Load all existing Target Audience records
  const taResult = await payload.find({
    collection: 'target-audience',
    limit: 100,
    pagination: false,
  })

  const taRecords = taResult.docs
  console.log(`Found ${taRecords.length} Target Audience records\n`)

  let created = 0
  let skipped = 0
  let linked = 0

  for (const ta of taRecords) {
    const industryName = ta.industry as string
    if (!industryName) {
      console.log(`⚠  TA ID ${ta.id} has no industry name — skipping`)
      continue
    }

    // Check if Industry already exists
    const { rows: existing } = await client.query<{ id: number }>(
      `SELECT id FROM industries WHERE name = $1 LIMIT 1`,
      [industryName],
    )

    let industryId: number

    if (existing.length > 0) {
      industryId = existing[0].id
      console.log(`⏭  Industry "${industryName}" already exists (ID: ${industryId})`)
      skipped++
    } else {
      // Insert directly via SQL — bypasses the afterChange hook
      const { rows } = await client.query<{ id: number }>(
        `INSERT INTO industries (name, updated_at, created_at) VALUES ($1, now(), now()) RETURNING id`,
        [industryName],
      )
      industryId = rows[0].id
      console.log(`✓  Created Industry "${industryName}" → ID: ${industryId}`)
      created++
    }

    // Link the Target Audience record via Payload (triggers beforeChange sync hook)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (payload.update as any)({
      collection: 'target-audience',
      id: ta.id,
      data: { industryRef: industryId, industry: industryName },
    })

    console.log(`   Linked TA ${ta.id} → Industry ${industryId}`)
    linked++
  }

  await client.end()

  console.log(`\n=== Done ===`)
  console.log(`Industries created: ${created}  skipped: ${skipped}`)
  console.log(`Target Audience records linked: ${linked}`)

  process.exit(0)
}

migrateIndustries().catch((err) => {
  console.error(err)
  process.exit(1)
})
