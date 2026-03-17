/**
 * runUpdatePass — shared logic used by both crons.
 * Given a set of posts, checks each for new developments and applies updates.
 */

import { checkForDevelopments, writeUpdateBlock, appendUpdateToLexical } from './articleUpdater'
import { lexicalToText } from './qualityChecker'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

type Post = {
  id: string | number
  title: string
  content: any
  articleUpdates?: {
    updateNumber: number
    updatedAt: string
    summary: string
    updateText: string
  }[]
}

type UpdateResult = {
  id: string | number
  title: string
  updated: boolean
  updateNumber?: number
  summary?: string
  skippedReason?: string
}

export async function runUpdatePass(
  posts: Post[],
  payload: any,
): Promise<UpdateResult[]> {
  const results: UpdateResult[] = []

  for (const post of posts) {
    const plainText = lexicalToText(post.content)

    if (!plainText || plainText.length < 100) {
      results.push({ id: post.id, title: post.title, updated: false, skippedReason: 'No content' })
      continue
    }

    const existingUpdates = (post.articleUpdates ?? []).map((u) => u.summary)

    let check
    try {
      check = await checkForDevelopments(post.title, plainText, existingUpdates)
    } catch (e) {
      console.error(`[update-pass] Gemini check failed for "${post.title}":`, e)
      results.push({ id: post.id, title: post.title, updated: false, skippedReason: `Gemini error: ${String(e)}` })
      await sleep(1000)
      continue
    }

    if (!check.hasNewInfo) {
      results.push({ id: post.id, title: post.title, updated: false, skippedReason: 'No new developments' })
      await sleep(500)
      continue
    }

    console.log(`[update-pass] New development found for "${post.title}": ${check.summary}`)

    const updateNumber = (post.articleUpdates?.length ?? 0) + 1
    const now = new Date()

    let updateBlock
    try {
      updateBlock = await writeUpdateBlock(post.title, updateNumber, check.newDetails, check.summary)
    } catch (e) {
      console.error(`[update-pass] Claude write failed for "${post.title}":`, e)
      results.push({ id: post.id, title: post.title, updated: false, skippedReason: `Claude error: ${String(e)}` })
      await sleep(1000)
      continue
    }

    const updatedLexical = appendUpdateToLexical(
      post.content,
      updateNumber,
      now,
      updateBlock.updateText,
    )

    const updatedArticleUpdates = [
      ...(post.articleUpdates ?? []),
      {
        updateNumber,
        updatedAt: now.toISOString(),
        summary: check.summary,
        updateText: updateBlock.updateText,
      },
    ]

    try {
      await payload.update({
        collection: 'posts',
        id: post.id,
        data: {
          content: updatedLexical,
          articleUpdates: updatedArticleUpdates,
          lastCheckedForUpdates: now.toISOString(),
        },
      })

      console.log(`[update-pass] Updated "${post.title}" — update #${updateNumber}`)
      results.push({
        id: post.id,
        title: post.title,
        updated: true,
        updateNumber,
        summary: check.summary,
      })
    } catch (e) {
      console.error(`[update-pass] Failed to save update for "${post.title}":`, e)
      results.push({ id: post.id, title: post.title, updated: false, skippedReason: `Save error: ${String(e)}` })
    }

    await sleep(800)
  }

  return results
}
