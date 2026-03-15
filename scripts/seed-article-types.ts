import { getPayload } from 'payload'
import config from '@payload-config'

const articleTypes = [
  {
    label: 'Authority Builder',
    description:
      'Establishes credibility and thought leadership. Explains why something matters rather than how to do it. Targets awareness-stage readers who are not yet problem-aware. Example: "Why Every Business Needs an Online Presence".',
  },
  {
    label: 'Pain Point',
    description:
      'Addresses a specific frustration the reader is already feeling. Opens by naming the pain directly. Targets problem-aware readers ready to consider a solution. Example: "The Hidden Cost of an Outdated Website".',
  },
  {
    label: 'Guide / How-To',
    description:
      'Practical, step-by-step or educational content. Teaches the reader something actionable. Targets readers actively researching a solution. Example: "Convert Visitors into Clients: The Essential Guide to Law Firm Website Design".',
  },
  {
    label: 'Listicle',
    description:
      'Numbered or bulleted list format. Scannable and shareable. Works well for "signs", "must-haves", and "features" topics. Example: "5 Signs Your Website is Driving Clients Away".',
  },
  {
    label: 'Comparison',
    description:
      'Positions one option against another — alternatives, competitors, or old vs new approaches. Targets readers who are evaluating options. Example: "Websites vs. Social Media: Why a Business Website Still Matters".',
  },
  {
    label: 'Service Spotlight',
    description:
      "Showcases Inspiria's services directly. More conversion-focused than other types. Explains what Inspiria offers, how it works, and why it's the right choice. Example: \"The All-in-One Solution for Your Law Firm Website\".",
  },
  {
    label: 'Niche / Situational',
    description:
      'Written for a very specific audience scenario or life event. Highly targeted, lower volume but high intent. Example: "Relocating to Canada as a Doctor? Why Your Online Portfolio is Your Secret Weapon".',
  },
]

async function seedArticleTypes() {
  const payload = await getPayload({ config })

  console.log('Seeding article types...\n')

  let created = 0
  let skipped = 0

  for (const entry of articleTypes) {
    const existing = await payload.find({
      collection: 'article-types',
      where: { label: { equals: entry.label } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      console.log(`⏭  Skipping "${entry.label}" — already exists (ID: ${existing.docs[0].id})`)
      skipped++
      continue
    }

    const record = await payload.create({
      collection: 'article-types',
      data: entry,
    })

    console.log(`✓  Created "${entry.label}" → ID: ${record.id}`)
    created++
  }

  console.log(`\n=== Done ===`)
  console.log(`Created: ${created}  Skipped: ${skipped}`)

  process.exit(0)
}

seedArticleTypes().catch((err) => {
  console.error(err)
  process.exit(1)
})
