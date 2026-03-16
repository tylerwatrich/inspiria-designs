import React from 'react'

type PageEntry = {
  path?: string
  title?: string
  visitedAt?: string
}

type StatCardProps = {
  label: string
  value: string | number
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <div
      style={{
        background: 'var(--theme-elevation-50)',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: '6px',
        padding: '0.75rem 1rem',
      }}
    >
      <div
        style={{
          fontSize: '11px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'var(--theme-elevation-500)',
          marginBottom: '4px',
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--theme-text)' }}>
        {String(value)}
      </div>
    </div>
  )
}

// Payload injects `doc` (the full document) directly as a prop on custom document views.
// No additional fetching needed — all visit history lives in doc.pages.
export default function VisitorActivityTab({ doc }: { doc?: Record<string, unknown> }) {
  if (!doc) {
    return <div style={{ padding: '2rem', color: 'var(--theme-text)' }}>Unable to load profile.</div>
  }

  const visitorId = doc.visitorId as string
  if (!visitorId) {
    return (
      <div style={{ padding: '2rem', color: 'var(--theme-elevation-500)' }}>
        No visitor ID on this record.
      </div>
    )
  }

  // doc.pages is the raw Payload array — entries may have an 'id' field prepended by Payload
  const pages = ((doc.pages as PageEntry[]) || [])
    .slice()
    .sort((a, b) => new Date(b.visitedAt || 0).getTime() - new Date(a.visitedAt || 0).getTime())

  const location = doc.city
    ? `${doc.city}, ${doc.country}`
    : doc.country
      ? String(doc.country)
      : '—'

  const fmt = (iso: string | undefined) =>
    iso
      ? new Date(iso).toLocaleDateString('en-CA', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : '—'

  const fmtTime = (iso: string | undefined) =>
    iso
      ? new Date(iso).toLocaleString('en-CA', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : ''

  return (
    <div style={{ padding: '1.5rem 2rem', maxWidth: '960px' }}>
      {/* Stats grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '0.75rem',
          marginBottom: '2rem',
        }}
      >
        <StatCard label="Pages Visited" value={String(doc.pageCount ?? pages.length)} />
        <StatCard label="Sessions" value={String(doc.sessionCount ?? '—')} />
        <StatCard label="Device" value={String(doc.deviceType ?? '—')} />
        <StatCard label="Browser" value={String(doc.browser ?? '—')} />
        <StatCard label="OS" value={String(doc.os ?? '—')} />
        <StatCard label="Location" value={location} />
        <StatCard label="First Source" value={String(doc.firstSource || 'Direct')} />
        <StatCard label="First UTM Source" value={String(doc.firstUtmSource || '—')} />
        <StatCard label="First Campaign" value={String(doc.firstUtmCampaign || '—')} />
        <StatCard label="First Seen" value={fmt(doc.createdAt as string)} />
        <StatCard label="Last Visit" value={fmt(doc.lastVisit as string)} />
        <StatCard label="IP Address" value={String(doc.ipAddress || '—')} />
      </div>

      {/* Fingerprint IDs */}
      <div
        style={{
          marginBottom: '2rem',
          padding: '0.75rem 1rem',
          background: 'var(--theme-elevation-50)',
          border: '1px solid var(--theme-elevation-150)',
          borderRadius: '6px',
          fontSize: '12px',
          fontFamily: 'monospace',
          color: 'var(--theme-elevation-600)',
          wordBreak: 'break-all',
          lineHeight: 2,
        }}
      >
        <span style={{ color: 'var(--theme-elevation-500)', fontFamily: 'sans-serif' }}>
          Fingerprint ID:{' '}
        </span>
        {String(doc.fingerprintId || 'not yet captured')}
        <br />
        <span style={{ color: 'var(--theme-elevation-500)', fontFamily: 'sans-serif' }}>
          Visitor UUID:{' '}
        </span>
        {visitorId}
        {!!doc.userAgent && (
          <>
            <br />
            <span style={{ color: 'var(--theme-elevation-500)', fontFamily: 'sans-serif' }}>
              User-Agent:{' '}
            </span>
            <span style={{ color: 'var(--theme-elevation-400)' }}>{String(doc.userAgent)}</span>
          </>
        )}
      </div>

      {/* Page visit timeline */}
      <div
        style={{
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--theme-elevation-500)',
          marginBottom: '1rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        Page Visits — {pages.length} visit{pages.length !== 1 ? 's' : ''}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {pages.map((page, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              gap: '12px',
              padding: '10px 14px',
              border: '1px solid var(--theme-elevation-100)',
              borderRadius: '6px',
              alignItems: 'flex-start',
            }}
          >
            <div style={{ fontSize: '14px', lineHeight: '1.6', userSelect: 'none', flexShrink: 0 }}>
              📄
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 500,
                  fontSize: '14px',
                  color: 'var(--theme-text)',
                  wordBreak: 'break-all',
                  marginBottom: page.title ? '3px' : 0,
                }}
              >
                {page.path || '—'}
              </div>
              {page.title && (
                <div style={{ fontSize: '12px', color: 'var(--theme-elevation-500)' }}>
                  {page.title}
                </div>
              )}
            </div>
            <div
              style={{
                fontSize: '11px',
                color: 'var(--theme-elevation-400)',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                paddingTop: '2px',
              }}
            >
              {fmtTime(page.visitedAt)}
            </div>
          </div>
        ))}
      </div>

      {pages.length === 0 && (
        <div
          style={{
            color: 'var(--theme-elevation-500)',
            fontStyle: 'italic',
            padding: '2rem',
            textAlign: 'center',
            border: '1px dashed var(--theme-elevation-150)',
            borderRadius: '6px',
          }}
        >
          No pages recorded yet.
        </div>
      )}
    </div>
  )
}
