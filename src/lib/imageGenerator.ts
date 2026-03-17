/**
 * Black Forest Labs Flux image generation for article headers
 *
 * Required env var: BFL_API_KEY
 *
 * Uses node:https directly to avoid undici's 10s connect timeout
 * that fires before AbortSignal can help.
 */

import https from 'node:https'

const BFL_HOST = 'api.bfl.ai'
const BFL_BASE_PATH = '/v1'
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

function httpsRequest(
  path: string,
  apiKey: string,
  method: 'GET' | 'POST' = 'GET',
  body?: object,
): Promise<{ ok: boolean; status: number; data: any }> {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : undefined
    const options: https.RequestOptions = {
      hostname: BFL_HOST,
      path: `${BFL_BASE_PATH}${path}`,
      method,
      timeout: REQUEST_TIMEOUT_MS,
      headers: {
        'X-Key': apiKey,
        ...(bodyStr
          ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(bodyStr) }
          : {}),
      },
    }

    const req = https.request(options, (res) => {
      let raw = ''
      res.on('data', (chunk) => { raw += chunk })
      res.on('end', () => {
        try {
          resolve({
            ok: (res.statusCode ?? 0) >= 200 && (res.statusCode ?? 0) < 300,
            status: res.statusCode ?? 0,
            data: JSON.parse(raw),
          })
        } catch {
          reject(new Error(`Failed to parse response: ${raw}`))
        }
      })
    })

    req.on('timeout', () => {
      req.destroy(new Error(`Request timed out after ${REQUEST_TIMEOUT_MS}ms`))
    })
    req.on('error', reject)

    if (bodyStr) req.write(bodyStr)
    req.end()
  })
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
    const { ok, status, data } = await httpsRequest('/flux-pro-1.1', apiKey, 'POST', {
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
      const { ok, status, data } = await httpsRequest(
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
