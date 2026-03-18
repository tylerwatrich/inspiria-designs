import { getPayload } from 'payload'
import config from '@payload-config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { postExportGuide } from '../src/endpoints/seed/post-export-guide'
import { imageCompass } from '../src/endpoints/seed/image-compass'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function seed() {
  const payload = await getPayload({ config })

  console.log('Seed: Starting Export Guide seed...')

  // 1. Check if post already exists
  const existingPost = await payload.find({
    collection: 'posts',
    where: {
      slug: {
        equals: 'how-to-find-new-export-markets-canada-stop-relying-on-us',
      },
    },
  })

  if (existingPost.docs.length > 0) {
    console.log('Seed: Post already exists, skipping.')
    process.exit(0)
  }

  // 2. Upload Media
  console.log('Seed: Uploading hero image...')
  const imagePath = path.resolve(__dirname, '../public/media/export-compass-hero.webp')
  
  if (!fs.existsSync(imagePath)) {
    console.error(`Seed: Image not found at ${imagePath}`)
    process.exit(1)
  }

  const imageBuffer = fs.readFileSync(imagePath)
  
  const mediaDoc = await payload.create({
    collection: 'media',
    data: imageCompass as any,
    file: {
      name: 'export-compass-hero.webp',
      data: imageBuffer,
      mimetype: 'image/webp',
      size: imageBuffer.length,
    },
  })

  console.log(`Seed: Media created with ID: ${mediaDoc.id}`)

  // 3. Find Demo Author
  const authors = await payload.find({
    collection: 'users',
    where: {
      email: {
        equals: 'demo-author@example.com',
      },
    },
  })
  
  const authorId = authors.docs[0]?.id

  // 4. Find/Create Category
  let categoryId
  const existingCat = await payload.find({
    collection: 'categories',
    where: {
      slug: {
        equals: 'finance',
      },
    },
  })

  if (existingCat.docs.length > 0) {
    categoryId = existingCat.docs[0].id
  }

  // 5. Create Post
  console.log('Seed: Creating blog post...')
  const postData = {
    ...postExportGuide,
    heroImage: mediaDoc.id,
    meta: {
      ...postExportGuide.meta,
      image: mediaDoc.id,
    },
    authors: authorId ? [authorId] : [],
    categories: categoryId ? [categoryId] : [],
  }

  const postDoc = await payload.create({
    collection: 'posts',
    data: postData as any,
  })

  console.log(`Seed: Post created with ID: ${postDoc.id}`)
  console.log('Seed: Done!')
  
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
