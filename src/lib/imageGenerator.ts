/**
 * Black Forest Labs Flux image generation for article headers
 *
 * Required env var: BFL_API_KEY
 */

const BFL_BASE = 'https://api.bfl.ml/v1'
const POLL_INTERVAL_MS = 2000
const TIMEOUT_MS = 60_000
const FETCH_TIMEOUT_MS = 30_000

const VERTICAL_STYLE_HINTS: Record<string, string> = {
  nuclear: 'industrial and technical, power plant infrastructure, clean energy engineering',
  'ai-cloud': 'abstract digital patterns, glowing neural networks, soft blue data streams',
  'construction-tech': 'architectural and urban, modern construction site, steel and glass structures',
  finance: 'minimal and corporate, clean geometric lines, subtle financial motif',
  trade: 'geographic and symbolic, Canadian landscape, international trade routes and cargo',
  'deep-tech': 'futuristic and scientific, quantum computing, advanced laboratory, circuit patterns',
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
    const res = await fetch(`${BFL_BASE}/flux-pro-1.1`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Key': apiKey,
      },
      body: JSON.stringify({
        prompt,
        width: 1200,
        height: 630,
      }),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    })

    if (!res.ok) {
      const text = await res.text()
      console.error(`[imageGenerator] Generation request failed (${res.status}): ${text}`)
      return null
    }

    const data = await res.json()
    generationId = data.id
    if (!generationId) {
      console.error('[imageGenerator] No ID in generation response:', data)
      return null
    }
  } catch (e) {
    console.error('[imageGenerator] Failed to start image generation:', e)
    return null
  }

  // Poll until Ready or timeout
  const deadline = Date.now() + TIMEOUT_MS
  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS))

    try {
      const pollRes = await fetch(`${BFL_BASE}/get_result?id=${generationId}`, {
        headers: { 'X-Key': apiKey },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      })

      if (!pollRes.ok) {
        console.error(`[imageGenerator] Poll failed (${pollRes.status}) for id: ${generationId}`)
        continue
      }

      const result = await pollRes.json()

      if (result.status === 'Ready') {
        const url: string | undefined = result.result?.sample
        if (!url) {
          console.error('[imageGenerator] Ready status but no sample URL:', result)
          return null
        }
        return url
      }

      if (result.status === 'Error' || result.status === 'Failed') {
        console.error('[imageGenerator] Generation failed with status:', result.status, result)
        return null
      }

      // Pending / Processing — keep polling
    } catch (e) {
      console.error('[imageGenerator] Poll error:', e)
    }
  }

  console.error(
    `[imageGenerator] Timed out after ${TIMEOUT_MS / 1000}s waiting for result. id: ${generationId}`,
  )
  return null
}
