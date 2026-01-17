import { getPayload, Payload } from 'payload'
import config from '@payload-config'
import fs from 'fs'
import path from 'path'
import { parseStringPromise } from 'xml2js'
import { DOMParser } from '@xmldom/xmldom'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

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
      const categories = item.category?.filter((cat: any) => 
        cat.$ && cat.$.domain === 'category'
      ).map((cat: any) => cat._) || []
      
      console.log(`\nProcessing: ${title}`)
      console.log(`  Slug: ${wpSlug}`)
      console.log(`  Categories: ${categories.join(', ')}`)
      
      // Generate slug if WordPress didn't provide one
      const generatedSlug = wpSlug || title
        .toLowerCase()
        .replace(/&amp;/g, 'and')
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-')      // Replace spaces with hyphens
        .replace(/-+/g, '-')       // Replace multiple hyphens with single
        .replace(/^-|-$/g, '')     // Trim hyphens from start/end
      
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
        if (createError.message?.includes('revalidatePath') || createError.message?.includes('static generation')) {
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
              console.log(`  ✓ Post created (ID: ${existingPost.docs[0].id}) - revalidation skipped`)
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
 * This preserves headings, paragraphs, lists, links, and basic formatting
 */
function convertHtmlToLexicalStructure(html: string) {
  const children: any[] = []
  
  // Parse HTML into a simple DOM-like structure
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  
  function processNode(node: Node): any[] {
    const result: any[] = []
    
    if (node.nodeType === 3) { // Text node
      const text = node.textContent || ''
      if (text.trim()) {
        return [{
          type: 'text',
          text: text,
          format: 0,
          detail: 0,
          mode: 'normal',
          style: '',
          version: 1,
        }]
      }
      return []
    }
    
    if (node.nodeType === 1) { // Element node
      const element = node as Element
      const tagName = element.tagName.toLowerCase()
      
      // Handle headings
      if (tagName.match(/^h[1-6]$/)) {
        const level = tagName.substring(1)
        return [{
          type: 'heading',
          tag: tagName,
          children: Array.from(element.childNodes).flatMap(child => processNode(child)),
          format: '' as const,
          indent: 0,
          direction: 'ltr' as const,
          version: 1,
        }]
      }
      
      // Handle paragraphs
      if (tagName === 'p') {
        const children = Array.from(element.childNodes).flatMap(child => processNode(child))
        if (children.length > 0) {
          return [{
            type: 'paragraph',
            children,
            format: '' as const,
            indent: 0,
            direction: 'ltr' as const,
            version: 1,
          }]
        }
        return []
      }
      
      // Handle lists
      if (tagName === 'ul' || tagName === 'ol') {
        const listType = tagName === 'ul' ? 'bullet' : 'number'
        return [{
          type: 'list',
          listType,
          start: 1,
          tag: tagName,
          children: Array.from(element.childNodes).flatMap(child => {
            if (child.nodeName.toLowerCase() === 'li') {
              return [{
                type: 'listitem',
                value: 1,
                children: Array.from(child.childNodes).flatMap(c => processNode(c)),
                format: '' as const,
                indent: 0,
                direction: 'ltr' as const,
                version: 1,
              }]
            }
            return []
          }),
          format: '' as const,
          indent: 0,
          direction: 'ltr' as const,
          version: 1,
        }]
      }
      
      // Handle links
      if (tagName === 'a') {
        return [{
          type: 'link',
          url: element.getAttribute('href') || '',
          children: Array.from(element.childNodes).flatMap(child => processNode(child)),
          format: '' as const,
          indent: 0,
          direction: 'ltr' as const,
          version: 1,
        }]
      }
      
      // Handle strong/bold
      if (tagName === 'strong' || tagName === 'b') {
        return Array.from(element.childNodes).flatMap(child => {
          const nodes = processNode(child)
          return nodes.map(n => {
            if (n.type === 'text') {
              return { ...n, format: 1 } // Bold format
            }
            return n
          })
        })
      }
      
      // Handle em/italic
      if (tagName === 'em' || tagName === 'i') {
        return Array.from(element.childNodes).flatMap(child => {
          const nodes = processNode(child)
          return nodes.map(n => {
            if (n.type === 'text') {
              return { ...n, format: 2 } // Italic format
            }
            return n
          })
        })
      }
      
      // Handle line breaks
      if (tagName === 'br') {
        return [{
          type: 'linebreak',
          version: 1,
        }]
      }
      
      // For other elements, process children
      return Array.from(element.childNodes).flatMap(child => processNode(child))
    }
    
    return []
  }
  
  // Process all body children
  Array.from(doc.body.childNodes).forEach(node => {
    const processed = processNode(node)
    children.push(...processed)
  })
  
  // If no valid children, create a default paragraph
  if (children.length === 0) {
    children.push({
      type: 'paragraph',
      format: '' as const,
      indent: 0,
      version: 1,
      children: [{
        type: 'text',
        format: 0,
        text: 'No content',
        mode: 'normal',
        style: '',
        detail: 0,
        version: 1,
      }],
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