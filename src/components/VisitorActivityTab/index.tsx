import React from 'react'

type PageVisit = {
  id: string
  path: string
  title?: string
  visitedAt?: string
  sessionId?: string
  isNewSession?: boolean
  timeOnPage?: number
  scrollDepth?: number
  referrer?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
}

type TrackingEvent = {
  id: string
  eventType: string
  eventName: string
  properties?: string
  path?: string
  occurredAt?: string
}

type StatCard = {
  label: string
  value: string | number
}

function StatCard({ label, value }: StatCard) {
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
      <div
        style={{
          fontSize: '15px',
          fontWeight: 600,
          color: 'var(--theme-text)',
        }}
      >
        {String(value)}
      </div>
    </div>
  )
}

// Payload passes the full document + payload instance as props to custom document views
export default async function VisitorActivityTab({
  doc,
  payload,
}: {
  doc?: Record<string, unknown>
  payload?: {
    find: (args: {
      collection: string
      where?: Record<string, unknown>
      limit?: number
      sort?: string
      overrideAccess?: boolean
    }) => Promise<{ docs: unknown[] }>
  }
}) {
  if (!doc || !payload) {
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

  const [visitsResult, eventsResult] = await Promise.all([
    payload.find({
      collection: 'page-visits',
      where: { visitorId: { equals: visitorId } },
      limit: 200,
      sort: '-visitedAt',
      overrideAccess: true,
    }),
    payload.find({
      collection: 'tracking-events',
      where: { visitorId: { equals: visitorId } },
      limit: 100,
      sort: '-occurredAt',
      overrideAccess: true,
    }),
  ])

  const visits = visitsResult.docs as PageVisit[]
  const events = eventsResult.docs as TrackingEvent[]

  const timeline = [
    ...visits.map((v) => ({ type: 'visit' as const, time: v.visitedAt || '', data: v })),
    ...events.map((e) => ({ type: 'event' as const, time: e.occurredAt || '', data: e })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())

  const location = doc.city
    ? `${doc.city}, ${doc.country}`
    : doc.country
      ? String(doc.country)
      : '—'

  const firstSeen = doc.createdAt
    ? new Date(doc.createdAt as string).toLocaleDateString('en-CA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '—'

  const lastVisit = doc.lastVisit
    ? new Date(doc.lastVisit as string).toLocaleDateString('en-CA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '—'

  return (
    <div style={{ padding: '1.5rem 2rem', maxWidth: '960px' }}>
      {/* Profile stat grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '0.75rem',
          marginBottom: '2rem',
        }}
      >
        <StatCard label="Pages Visited" value={String(doc.pageCount ?? 0)} />
        <StatCard label="Sessions" value={String(doc.sessionCount ?? 0)} />
        <StatCard label="Device" value={String(doc.deviceType ?? '—')} />
        <StatCard label="Browser" value={String(doc.browser ?? '—')} />
        <StatCard label="OS" value={String(doc.os ?? '—')} />
        <StatCard label="Location" value={location} />
        <StatCard label="First Source" value={String(doc.firstSource || 'Direct')} />
        <StatCard label="First UTM Source" value={String(doc.firstUtmSource || '—')} />
        <StatCard label="First Campaign" value={String(doc.firstUtmCampaign || '—')} />
        <StatCard label="First Seen" value={firstSeen} />
        <StatCard label="Last Visit" value={lastVisit} />
        <StatCard label="Total Events" value={events.length} />
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
          lineHeight: 1.8,
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
      </div>

      {/* Activity timeline */}
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
        Activity — {timeline.length} item{timeline.length !== 1 ? 's' : ''}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {timeline.map((item, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              gap: '12px',
              padding: '10px 14px',
              background: item.type === 'event' ? 'var(--theme-elevation-50)' : 'transparent',
              border: '1px solid var(--theme-elevation-100)',
              borderRadius: '6px',
              alignItems: 'flex-start',
            }}
          >
            {/* Icon */}
            <div style={{ fontSize: '14px', lineHeight: '1.6', userSelect: 'none', flexShrink: 0 }}>
              {item.type === 'visit' ? '📄' : '⚡'}
            </div>

            {/* Main content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {item.type === 'visit' ? (
                <>
                  <div
                    style={{
                      fontWeight: 500,
                      color: 'var(--theme-text)',
                      marginBottom: '4px',
                      wordBreak: 'break-all',
                      display: 'flex',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '6px',
                    }}
                  >
                    <span style={{ fontSize: '14px' }}>{(item.data as PageVisit).path}</span>
                    {(item.data as PageVisit).isNewSession && (
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 600,
                          background: 'var(--theme-success-50)',
                          color: 'var(--theme-success-500)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          flexShrink: 0,
                        }}
                      >
                        New Session
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: 'var(--theme-elevation-500)',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '10px',
                    }}
                  >
                    {(item.data as PageVisit).timeOnPage != null && (
                      <span>⏱ {(item.data as PageVisit).timeOnPage}s on page</span>
                    )}
                    {(item.data as PageVisit).scrollDepth != null && (
                      <span>↕ {(item.data as PageVisit).scrollDepth}% scrolled</span>
                    )}
                    {(item.data as PageVisit).utmSource && (
                      <span>
                        📎{' '}
                        {[
                          (item.data as PageVisit).utmSource,
                          (item.data as PageVisit).utmMedium,
                          (item.data as PageVisit).utmCampaign,
                        ]
                          .filter(Boolean)
                          .join(' / ')}
                      </span>
                    )}
                    {(item.data as PageVisit).referrer && (
                      <span>↩ {(item.data as PageVisit).referrer}</span>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div
                    style={{
                      fontWeight: 500,
                      color: 'var(--theme-text)',
                      marginBottom: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        background: 'var(--theme-elevation-100)',
                        color: 'var(--theme-elevation-800)',
                        padding: '2px 7px',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        flexShrink: 0,
                      }}
                    >
                      {(item.data as TrackingEvent).eventType}
                    </span>
                    <span style={{ fontSize: '14px' }}>{(item.data as TrackingEvent).eventName}</span>
                  </div>
                  {(item.data as TrackingEvent).properties && (
                    <div
                      style={{
                        fontSize: '12px',
                        color: 'var(--theme-elevation-500)',
                        fontFamily: 'monospace',
                        marginBottom: '4px',
                      }}
                    >
                      {(item.data as TrackingEvent).properties}
                    </div>
                  )}
                  {(item.data as TrackingEvent).path && (
                    <div style={{ fontSize: '12px', color: 'var(--theme-elevation-400)' }}>
                      {(item.data as TrackingEvent).path}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Timestamp */}
            <div
              style={{
                fontSize: '11px',
                color: 'var(--theme-elevation-400)',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                paddingTop: '2px',
              }}
            >
              {item.time
                ? new Date(item.time).toLocaleString('en-CA', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : ''}
            </div>
          </div>
        ))}
      </div>

      {timeline.length === 0 && (
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
          No activity recorded yet.
        </div>
      )}
    </div>
  )
}
