import { getPayload, Payload } from 'payload'
import config from '@payload-config'
import fs from 'fs'
import path from 'path'
import { parseStringPromise } from 'xml2js'
import { parse } from 'node-html-parser'

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
 * Preserves headings and paragraphs with basic formatting
 */
function convertHtmlToLexicalStructure(html: string) {
  const root = parse(html)
  const children: any[] = []

  function processTextNode(text: string, format = 0): any {
    if (!text.trim()) return null
    return {
      type: 'text',
      text: text,
      format,
      detail: 0,
      mode: 'normal',
      style: '',
      version: 1,
    }
  }

  function processChildren(nodes: any[], format = 0): any[] {
    const result: any[] = []

    for (const node of nodes) {
      if (node.nodeType === 3) {
        // Text node
        const textNode = processTextNode(node.rawText, format)
        if (textNode) result.push(textNode)
      } else if (node.nodeType === 1) {
        // Element node
        const tagName = node.rawTagName?.toLowerCase()

        if (tagName === 'strong' || tagName === 'b') {
          result.push(...processChildren(node.childNodes, 1)) // Bold
        } else if (tagName === 'em' || tagName === 'i') {
          result.push(...processChildren(node.childNodes, 2)) // Italic
        } else if (tagName === 'a') {
          const linkChildren = processChildren(node.childNodes, format)
          if (linkChildren.length > 0) {
            result.push({
              type: 'link',
              fields: {
                url: node.getAttribute('href') || '',
                linkType: 'custom',
              },
              children: linkChildren,
              direction: 'ltr' as const,
              format: '' as const,
              indent: 0,
              version: 2,
            })
          }
        } else {
          result.push(...processChildren(node.childNodes, format))
        }
      }
    }

    return result
  }

  function processNode(node: any): any[] {
    if (node.nodeType === 3) {
      // Text node
      const text = node.rawText.trim()
      if (!text) return []

      return [
        {
          type: 'paragraph',
          children: [processTextNode(text)].filter(Boolean),
          format: '' as const,
          indent: 0,
          direction: 'ltr' as const,
          version: 1,
        },
      ]
    }

    if (node.nodeType !== 1) return []

    const tagName = node.rawTagName?.toLowerCase()

    // Handle headings
    if (/^h[1-6]$/.test(tagName)) {
      const textChildren = processChildren(node.childNodes)
      if (textChildren.length === 0) return []

      return [
        {
          type: 'heading',
          tag: tagName,
          children: textChildren,
          format: '' as const,
          indent: 0,
          direction: 'ltr' as const,
          version: 1,
        },
      ]
    }

    // Handle paragraphs
    if (tagName === 'p') {
      const textChildren = processChildren(node.childNodes)
      if (textChildren.length === 0) return []

      return [
        {
          type: 'paragraph',
          children: textChildren,
          format: '' as const,
          indent: 0,
          direction: 'ltr' as const,
          version: 1,
        },
      ]
    }

    // Handle lists - convert to simple bullet paragraphs (Lexical list format is finicky)
    if (tagName === 'ul' || tagName === 'ol') {
      const results: any[] = []
      const listItems = node.querySelectorAll('li')

      listItems.forEach((li: any, index: number) => {
        const text = li.text.trim()
        if (text) {
          const prefix = tagName === 'ul' ? '• ' : `${index + 1}. `

          results.push({
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: prefix + text,
                format: 0,
                detail: 0,
                mode: 'normal',
                style: '',
                version: 1,
              },
            ],
            format: '' as const,
            indent: 0,
            direction: 'ltr' as const,
            version: 1,
          })
        }
      })

      return results
    }

    // For divs and other containers, process children
    if (tagName === 'div' || !tagName) {
      const results: any[] = []
      for (const child of node.childNodes) {
        results.push(...processNode(child))
      }
      return results
    }

    return []
  }

  // Process all top-level nodes
  for (const node of root.childNodes) {
    children.push(...processNode(node))
  }

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
