/**
 * Black Forest Labs Flux image generation for article headers
 *
 * Required env var: BFL_API_KEY
 *
 * Uses undici's request() directly to set connectTimeout — Node.js global
 * fetch defaults to 10s connect timeout which BFL's API regularly exceeds.
 */

import { request } from 'undici'

const BFL_BASE = 'https://api.bfl.ml/v1'
const POLL_INTERVAL_MS = 2000
const POLL_TIMEOUT_MS = 90_000
const REQUEST_TIMEOUT_MS = 30_000

const VERTICAL_STYLE_HINTS: Record<string, string> = {
  nuclear: 'industrial and technical, power plant infrastructure, clean energy engineering',
  'ai-cloud': 'abstract digital patterns, glowing neural networks, soft blue data streams',
  'construction-tech': 'architectural and urban, modern construction site, steel and glass structures',
  finance: 'minimal and corporate, clean geometric lines, subtle financial motif',
  trade: 'geographic and symbolic, Canadian landscape, international trade routes and cargo',
  'deep-tech': 'futuristic and scientific, quantum computing, advanced laboratory, circuit patterns',
}

async function bflRequest(
  path: string,
  apiKey: string,
  method: 'GET' | 'POST' = 'GET',
  body?: object,
): Promise<{ ok: boolean; status: number; data: any }> {
  const { statusCode, body: responseBody } = await request(`${BFL_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Key': apiKey,
    },
    body: body ? JSON.stringify(body) : undefined,
    headersTimeout: REQUEST_TIMEOUT_MS,
    bodyTimeout: REQUEST_TIMEOUT_MS,
    connectTimeout: REQUEST_TIMEOUT_MS,
  })

  const data = await responseBody.json()
  return { ok: statusCode >= 200 && statusCode < 300, status: statusCode, data }
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

  let generationId: string
  try {
    const { ok, status, data } = await bflRequest('/flux-pro-1.1', apiKey, 'POST', {
      prompt,
      width: 1200,
      height: 630,
    })

    if (!ok) {
      console.error(`[imageGenerator] Generation request failed (${status}):`, data)
      return null
    }

    generationId = data.id
    if (!generationId) {
      console.error('[imageGenerator] No ID in generation response:', data)
      return null
    }
    console.log(`[imageGenerator] Generation started, id: ${generationId}`)
  } catch (e) {
    console.error('[imageGenerator] Failed to start image generation:', e)
    return null
  }

  // Poll until Ready or timeout
  const deadline = Date.now() + POLL_TIMEOUT_MS
  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS))

    try {
      const { ok, status, data } = await bflRequest(
        `/get_result?id=${generationId}`,
        apiKey,
      )

      if (!ok) {
        console.error(`[imageGenerator] Poll failed (${status}) for id: ${generationId}`)
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

  console.error(
    `[imageGenerator] Timed out after ${POLL_TIMEOUT_MS / 1000}s. id: ${generationId}`,
  )
  return null
}
