import { getPayload, Payload } from 'payload'
import config from '@payload-config'
import fs from 'fs'
import path from 'path'
import { parseStringPromise } from 'xml2js'

async function migrateWordPressPosts() {
  const payload = await getPayload({ config })

  // Read the WordPress XML export file
  const xmlPath = path.join(process.cwd(), 'wordpress-export.xml')
  const xmlContent = fs.readFileSync(xmlPath, 'utf-8')

  console.log('Parsing WordPress XML...')
  const parsed = await parseStringPromise(xmlContent)

  const channel = parsed.rss.channel[0]
  const items = channel.item || []

  console.log(`Found ${items.length} items in WordPress export`)

  let postsCreated = 0
  let postsSkipped = 0

  for (const item of items) {
    // Only process published posts (skip pages, attachments, etc.)
    const postType = item['wp:post_type']?.[0]
    const status = item['wp:status']?.[0]

    if (postType !== 'post') {
      console.log(`Skipping non-post item: ${postType}`)
      postsSkipped++
      continue
    }

    try {
      // Extract basic post data
      const title = item.title?.[0] || 'Untitled'
      const wpSlug = item['wp:post_name']?.[0] || ''
      const pubDate = item.pubDate?.[0] ? new Date(item.pubDate[0]) : new Date()
      const wpContent = item['content:encoded']?.[0] || ''
      const excerpt = item['excerpt:encoded']?.[0] || ''

      // Extract Yoast SEO data
      const yoastTitle = item['_yoast_wpseo_title']?.[0] || ''
      const yoastDescription = item['_yoast_wpseo_metadesc']?.[0] || ''

      // Extract categories
      const categories =
        item.category
          ?.filter((cat: any) => cat.$ && cat.$.domain === 'category')
          .map((cat: any) => cat._) || []

      console.log(`\nProcessing: ${title}`)
      console.log(`  Slug: ${wpSlug}`)
      console.log(`  Categories: ${categories.join(', ')}`)

      // Generate slug if WordPress didn't provide one
      const generatedSlug =
        wpSlug ||
        title
          .toLowerCase()
          .replace(/&amp;/g, 'and')
          .replace(/[^\w\s-]/g, '') // Remove special characters
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .replace(/-+/g, '-') // Replace multiple hyphens with single
          .replace(/^-|-$/g, '') // Trim hyphens from start/end

      if (!generatedSlug) {
        console.log(`  ✗ Skipping - no valid slug could be generated`)
        postsSkipped++
        continue
      }

      // Convert HTML content to Lexical-compatible format
      const contentText = convertHtmlToLexicalStructure(wpContent)

      // Create the post in Payload
      let createSuccess = false
      try {
        const newPost = await payload.create({
          collection: 'posts',
          data: {
            title,
            slug: generatedSlug,
            content: contentText,
            publishedAt: pubDate.toISOString(),
            _status: status === 'publish' ? 'published' : 'draft',
            meta: {
              title: yoastTitle || title,
              description: yoastDescription || excerpt || '',
            },
            // You can add category mapping here if you create categories first
            // categories: await mapCategories(categories, payload),
          },
        })

        console.log(`  ✓ Created post ID: ${newPost.id}`)
        postsCreated++
        createSuccess = true
      } catch (createError: any) {
        // Check if it's just a revalidation error (post might still be created)
        if (
          createError.message?.includes('revalidatePath') ||
          createError.message?.includes('static generation')
        ) {
          // Verify if post was actually created by checking for it
          try {
            const existingPost = await payload.find({
              collection: 'posts',
              where: {
                slug: {
                  equals: generatedSlug,
                },
              },
              limit: 1,
            })

            if (existingPost.docs.length > 0) {
              console.log(
                `  ✓ Post created (ID: ${existingPost.docs[0].id}) - revalidation skipped`,
              )
              postsCreated++
              createSuccess = true
            }
          } catch (verifyError) {
            // If we can't verify, assume it failed
            throw createError
          }
        }

        if (!createSuccess) {
          throw createError
        }
      }
    } catch (error) {
      console.error(`  ✗ Error creating post "${item.title?.[0]}":`, (error as Error).message)
      postsSkipped++
    }
  }

  console.log('\n=== Migration Complete ===')
  console.log(`Posts created: ${postsCreated}`)
  console.log(`Posts skipped: ${postsSkipped}`)

  process.exit(0)
}

/**
 * Convert WordPress HTML content to Lexical editor format
 * Simplified version that creates basic paragraphs
 */
function convertHtmlToLexicalStructure(html: string) {
  // Strip HTML tags and get plain text, preserving line breaks
  const stripped = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim()

  // Split into paragraphs
  const paragraphs = stripped
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0)

  const children = paragraphs.map((text) => ({
    type: 'paragraph',
    format: '' as const,
    indent: 0,
    version: 1,
    children: [
      {
        type: 'text',
        format: 0,
        text: text,
        mode: 'normal',
        style: '',
        detail: 0,
        version: 1,
      },
    ],
    direction: 'ltr' as const,
  }))

  // If no content, create default paragraph
  if (children.length === 0) {
    children.push({
      type: 'paragraph',
      format: '' as const,
      indent: 0,
      version: 1,
      children: [
        {
          type: 'text',
          format: 0,
          text: 'No content',
          mode: 'normal',
          style: '',
          detail: 0,
          version: 1,
        },
      ],
      direction: 'ltr' as const,
    })
  }

  return {
    root: {
      type: 'root',
      format: '' as const,
      indent: 0,
      version: 1,
      children,
      direction: 'ltr' as const,
    },
  }
}

/**
 * Optional: Map WordPress categories to Payload categories
 * You'd need to create categories first or match existing ones
 */
async function mapCategories(wpCategories: string[], payload: Payload) {
  const categoryIds = []

  for (const catName of wpCategories) {
    // Try to find existing category
    const existing = await payload.find({
      collection: 'categories',
      where: {
        title: {
          equals: catName,
        },
      },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      categoryIds.push(existing.docs[0].id)
    } else {
      // Create new category
      const newCat = await payload.create({
        collection: 'categories',
        data: {
          title: catName,
          slug: catName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        },
      })
      categoryIds.push(newCat.id)
    }
  }

  return categoryIds
}

// Run the migration
migrateWordPressPosts().catch(console.error)
