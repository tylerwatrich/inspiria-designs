'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

type DbRunStatus = 'running' | 'completed' | 'error'

type RunState = {
  status: DbRunStatus
  startedAt: string
  completedAt: string | null
  message: string
} | null

type JobStatusMap = Record<string, RunState>

type Job = {
  key: string
  label: string
  description: string
}

const JOBS: Job[] = [
  {
    key: 'scan-news',
    label: 'Scan News',
    description: 'Find new stories across CBN, Industry Insights, and Resources',
  },
  {
    key: 'write-post',
    label: 'Write Post',
    description: 'Pick best suggestion → fact-check → write → publish (or draft)',
  },
  {
    key: 'generate-images',
    label: 'Generate Images',
    description: 'Generate hero images for published posts that are missing one',
  },
  {
    key: 'update-articles',
    label: 'Update Articles',
    description: 'Refresh older posts with current information',
  },
  {
    key: 'quality-audit',
    label: 'Quality Audit',
    description: 'Score published posts and flag ones needing improvement',
  },
]

const NOTE: Record<string, string> = {
  'scan-news': 'Runs in background — takes ~3 min due to rate-limit gaps between area scans.',
  'write-post': 'Runs in background — full pipeline takes 1–2 min.',
}

const POLL_INTERVAL = 5_000

export default function AIControlPanel() {
  const [runStates, setRunStates] = useState<JobStatusMap>({})
  // Tracks in-flight HTTP trigger request (before DB record is created)
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({})
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchStatuses = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/job-status')
      if (!res.ok) return
      const data: JobStatusMap = await res.json()
      setRunStates(data)
      return data
    } catch {
      // non-fatal — panel still usable
    }
  }, [])

  // Start/stop polling based on whether any job is currently running
  const syncPolling = useCallback((states: JobStatusMap) => {
    const anyRunning = Object.values(states).some((s) => s?.status === 'running')

    if (anyRunning && !pollRef.current) {
      pollRef.current = setInterval(async () => {
        const fresh = await fetchStatuses()
        if (fresh) syncPolling(fresh)
      }, POLL_INTERVAL)
    } else if (!anyRunning && pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [fetchStatuses])

  // Initial fetch on mount
  useEffect(() => {
    fetchStatuses().then((data) => {
      if (data) syncPolling(data)
    })

    // Re-fetch when the tab becomes visible (covers navigate-away + come-back, and tab reopen)
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        fetchStatuses().then((data) => {
          if (data) syncPolling(data)
        })
      }
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [fetchStatuses, syncPolling])

  async function trigger(job: string) {
    setSubmitting((s) => ({ ...s, [job]: true }))

    try {
      const res = await fetch('/api/admin/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)

      // Fetch immediately so button transitions to "Running…" without waiting for the next poll
      const fresh = await fetchStatuses()
      if (fresh) syncPolling(fresh)
    } catch (e) {
      // On trigger failure, force an error state locally so the user sees feedback
      setRunStates((prev) => ({
        ...prev,
        [job]: {
          status: 'error',
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          message: String(e),
        },
      }))
    } finally {
      setSubmitting((s) => ({ ...s, [job]: false }))
    }
  }

  function formatTime(iso: string | null | undefined): string {
    if (!iso) return ''
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div
      style={{
        marginBottom: 32,
        background: '#111827',
        border: '1px solid #1f2937',
        borderRadius: 10,
        padding: '20px 24px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 20 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#a78bfa' }}>
          ✦ AI Writer Control Panel
        </span>
        <span style={{ fontSize: 12, color: '#4b5563' }}>Manual triggers — admin only</span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 10,
        }}
      >
        {JOBS.map((job) => {
          const run = runStates[job.key]
          const isSubmitting = submitting[job.key] ?? false
          const isRunning = run?.status === 'running'
          const isDisabled = isSubmitting || isRunning

          const borderColor =
            run?.status === 'error'
              ? '#7f1d1d'
              : run?.status === 'completed'
              ? '#14532d'
              : run?.status === 'running'
              ? '#1e3a5f'
              : '#1f2937'

          const btnBg = isDisabled ? '#374151' : '#5b21b6'

          const btnLabel = isSubmitting
            ? 'Starting…'
            : isRunning
            ? 'Running…'
            : 'Run'

          const note = NOTE[job.key]
          const showNote = run?.status === 'completed' && note

          return (
            <div
              key={job.key}
              style={{
                background: '#1a1f2e',
                border: `1px solid ${borderColor}`,
                borderRadius: 8,
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#e5e7eb' }}>{job.label}</div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2, lineHeight: 1.4 }}>
                    {job.description}
                  </div>
                </div>
                <button
                  onClick={() => trigger(job.key)}
                  disabled={isDisabled}
                  style={{
                    background: btnBg,
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '6px 14px',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    opacity: isDisabled ? 0.7 : 1,
                  }}
                >
                  {btnLabel}
                </button>
              </div>

              {(run?.message || run?.completedAt || showNote) && (
                <div
                  style={{
                    fontSize: 11,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 8,
                    paddingTop: 4,
                    borderTop: '1px solid #1f2937',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    {run?.message && (
                      <span
                        style={{
                          color:
                            run.status === 'error'
                              ? '#f87171'
                              : run.status === 'running'
                              ? '#60a5fa'
                              : '#34d399',
                        }}
                      >
                        {run.message}
                      </span>
                    )}
                    {showNote && (
                      <div style={{ color: '#6b7280', marginTop: run?.message ? 2 : 0 }}>{note}</div>
                    )}
                  </div>
                  {run?.completedAt && (
                    <span style={{ color: '#4b5563', flexShrink: 0 }}>
                      last run {formatTime(run.completedAt)}
                    </span>
                  )}
                  {isRunning && run?.startedAt && (
                    <span style={{ color: '#4b5563', flexShrink: 0 }}>
                      started {formatTime(run.startedAt)}
                    </span>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
