'use client'

import { useState } from 'react'

type JobStatus = 'idle' | 'loading' | 'success' | 'error'

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

export default function AIControlPanel() {
  const [statuses, setStatuses] = useState<Record<string, JobStatus>>({})
  const [messages, setMessages] = useState<Record<string, string>>({})
  const [lastRun, setLastRun] = useState<Record<string, string>>({})

  async function trigger(job: string) {
    setStatuses((s) => ({ ...s, [job]: 'loading' }))
    setMessages((m) => ({ ...m, [job]: '' }))

    try {
      const res = await fetch('/api/admin/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
      setStatuses((s) => ({ ...s, [job]: 'success' }))
      setMessages((m) => ({ ...m, [job]: data.message || 'Started' }))
      setLastRun((r) => ({ ...r, [job]: new Date().toLocaleTimeString() }))
    } catch (e) {
      setStatuses((s) => ({ ...s, [job]: 'error' }))
      setMessages((m) => ({ ...m, [job]: String(e) }))
    }
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
          const status = statuses[job.key] ?? 'idle'
          const msg = messages[job.key]
          const ran = lastRun[job.key]
          const note = NOTE[job.key]

          const borderColor =
            status === 'error' ? '#7f1d1d' : status === 'success' ? '#14532d' : '#1f2937'
          const btnBg = status === 'loading' ? '#374151' : '#5b21b6'

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
                  disabled={status === 'loading'}
                  style={{
                    background: btnBg,
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '6px 14px',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    opacity: status === 'loading' ? 0.7 : 1,
                  }}
                >
                  {status === 'loading' ? 'Starting…' : 'Run'}
                </button>
              </div>

              {(msg || ran || (status === 'success' && note)) && (
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
                    {msg && (
                      <span style={{ color: status === 'error' ? '#f87171' : '#34d399' }}>
                        {msg}
                      </span>
                    )}
                    {status === 'success' && note && (
                      <div style={{ color: '#6b7280', marginTop: msg ? 2 : 0 }}>{note}</div>
                    )}
                  </div>
                  {ran && (
                    <span style={{ color: '#4b5563', flexShrink: 0 }}>last run {ran}</span>
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
