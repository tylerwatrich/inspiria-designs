import { put } from '@vercel/blob'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const mediaDir = path.resolve(__dirname, '../public/media')
const token = process.env.BLOB_READ_WRITE_TOKEN

if (!token) {
  console.error('BLOB_READ_WRITE_TOKEN is not set')
  process.exit(1)
}

const files = fs.readdirSync(mediaDir)
console.log(`Uploading ${files.length} files to Vercel Blob...`)

let success = 0
let failed = 0

for (const filename of files) {
  const filePath = path.join(mediaDir, filename)
  const fileBuffer = fs.readFileSync(filePath)
  const ext = path.extname(filename).toLowerCase()
  const mimeTypes = {
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
    '.png': 'image/png', '.gif': 'image/gif',
    '.webp': 'image/webp', '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
  }
  const contentType = mimeTypes[ext] || 'application/octet-stream'

  try {
    const result = await put(`media/${filename}`, fileBuffer, {
      access: 'public',
      contentType,
      token,
      addRandomSuffix: false,
    })
    console.log(`✓ ${filename} → ${result.url}`)
    success++
  } catch (err) {
    console.error(`✗ ${filename}: ${err.message}`)
    failed++
  }
}

console.log(`\nDone: ${success} uploaded, ${failed} failed`)
