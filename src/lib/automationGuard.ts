/**
 * automationGuard — reads the AutomationSettings global and returns
 * whether a specific function is enabled.
 */

type SettingsKey =
  | 'scanNewsEnabled'
  | 'rePrioritizeEnabled'
  | 'autoWriteEnabled'
  | 'autoPublishEnabled'

type Guard = {
  check: (key: SettingsKey) => boolean
  pausedResponse: (message: string) => Response
  settings: Record<string, boolean>
}

export async function automationGuard(payload: any): Promise<Guard> {
  let settings: Record<string, boolean> = {}

  try {
    const global = await payload.findGlobal({ slug: 'automation-settings' })
    settings = global ?? {}
  } catch (e) {
    console.warn('[automationGuard] Could not read automation-settings global — defaulting to all enabled:', e)
  }

  return {
    settings,

    check(key: SettingsKey): boolean {
      return settings[key] !== false
    },

    pausedResponse(message: string): Response {
      console.log(`[automationGuard] Skipped: ${message}`)
      return new Response(
        JSON.stringify({ success: true, paused: true, message }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    },
  }
}
