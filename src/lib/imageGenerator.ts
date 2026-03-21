/**
 * Black Forest Labs Flux image generation for article headers
 *
 * Required env var: BFL_API_KEY
 *
 * Important: BFL returns a polling_url in the generation response that may
 * be on a different subdomain (e.g. api.us2.bfl.ai). Always use that URL
 * directly rather than constructing the poll path manually.
 */

const BFL_GENERATE_URL = 'https://api.bfl.ai/v1/flux-pro-1.1'
const POLL_INTERVAL_MS = 2000
const POLL_TIMEOUT_MS = 90_000
const REQUEST_TIMEOUT_MS = 60_000

const VERTICAL_STYLE_HINTS: Record<string, string> = {
  // Canadian Business News
  nuclear: 'industrial and technical, power plant infrastructure, clean energy engineering',
  'ai-cloud': 'abstract digital patterns, glowing neural networks, soft blue data streams',
  'construction-tech': 'architectural and urban, modern construction site, steel and glass structures',
  finance: 'minimal and corporate, clean geometric lines, subtle financial motif',
  trade: 'geographic and symbolic, Canadian landscape, international trade routes and cargo',
  'deep-tech': 'futuristic and scientific, quantum computing, advanced laboratory, circuit patterns',
  // Industry Insights
  legal: 'professional and modern, law office interior, clean legal iconography, justice and documents',
  contractors: 'construction site and skilled trades, blueprints and tools, Canadian urban development',
  'real-estate': 'modern Canadian real estate, property exterior, architectural photography, urban and suburban',
  procurement: 'government and corporate, formal meeting room, contract documents, institutional setting',
  // Resources
  'website-basics': 'clean digital workspace, laptop and website wireframe, minimal web design illustration',
  seo: 'abstract search and discovery, magnifying glass, data visualization, digital pathways',
  ecommerce: 'online shopping and commerce, product display, digital checkout, Canadian small business retail',
}

async function bflFetch(
  url: string,
  apiKey: string,
  method: 'GET' | 'POST' = 'GET',
  body?: object,
): Promise<{ ok: boolean; status: number; data: any }> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      method,
      signal: controller.signal,
      headers: {
        'X-Key': apiKey,
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    })
    const data = await res.json()
    return { ok: res.ok, status: res.status, data }
  } finally {
    clearTimeout(timer)
  }
}

async function downloadImage(url: string): Promise<Buffer> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) throw new Error(`Download failed: ${res.status}`)
    return Buffer.from(await res.arrayBuffer())
  } finally {
    clearTimeout(timer)
  }
}

export async function saveImageToMedia(
  bflUrl: string,
  title: string,
  payload: import('payload').Payload,
): Promise<number | null> {
  const filename =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) + '-hero.jpg'

  try {
    const buffer = await downloadImage(bflUrl)

    const result = await payload.create({
      collection: 'media',
      data: { alt: title },
      file: {
        data: buffer,
        mimetype: 'image/jpeg',
        name: filename,
        size: buffer.length,
      },
      overrideAccess: true,
    })

    const id = Number(result.id)
    if (!id) {
      console.error('[imageGenerator] Local API create returned no id:', result)
      return null
    }
    console.log(`[imageGenerator] Saved to media: ${id} (${filename})`)
    return id
  } catch (e) {
    console.error('[imageGenerator] Failed to save image to media:', e)
    return null
  }
}

export async function generateArticleImage(
  title: string,
  vertical: string,
): Promise<string | null> {
  const apiKey = process.env.BFL_API_KEY
  if (!apiKey) {
    console.error('[imageGenerator] BFL_API_KEY is not set — skipping image generation')
    return null
  }

  const styleHint = VERTICAL_STYLE_HINTS[vertical] ?? 'clean, professional, editorial'
  const prompt =
    `Editorial header illustration for a Canadian business news article titled "${title}". ` +
    `${styleHint}. High-quality digital art or photorealistic. ` +
    `No text, no words, no logos, no overlays. Wide format, clean composition, professional publication quality.`

  let pollingUrl: string
  try {
    const { ok, status, data } = await bflFetch(BFL_GENERATE_URL, apiKey, 'POST', {
      prompt,
      width: 1216,
      height: 640,
    })

    if (!ok) {
      console.error(`[imageGenerator] Generation request failed (${status}):`, data)
      return null
    }

    pollingUrl = data.polling_url
    if (!pollingUrl) {
      console.error('[imageGenerator] No polling_url in generation response:', data)
      return null
    }
    console.log(`[imageGenerator] Generation started, polling: ${pollingUrl}`)
  } catch (e) {
    console.error('[imageGenerator] Failed to start image generation:', e)
    return null
  }

  // Poll until Ready or timeout
  const deadline = Date.now() + POLL_TIMEOUT_MS
  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS))

    try {
      const { ok, status, data } = await bflFetch(pollingUrl, apiKey)

      if (!ok) {
        console.error(`[imageGenerator] Poll failed (${status}): ${pollingUrl}`)
        continue
      }

      if (data.status === 'Ready') {
        const url: string | undefined = data.result?.sample
        if (!url) {
          console.error('[imageGenerator] Ready status but no sample URL:', data)
          return null
        }
        console.log(`[imageGenerator] Image ready: ${url}`)
        return url
      }

      if (data.status === 'Error' || data.status === 'Failed') {
        console.error('[imageGenerator] Generation failed:', data)
        return null
      }

      // Pending / Processing — keep polling
    } catch (e) {
      console.error('[imageGenerator] Poll error:', e)
    }
  }

  console.error(`[imageGenerator] Timed out after ${POLL_TIMEOUT_MS / 1000}s`)
  return null
}
