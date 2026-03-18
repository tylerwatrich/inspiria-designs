'use client'

export function AutomationStatusBanner() {
  return (
    <div style={{
      background: '#0f172a',
      border: '1px solid #1e293b',
      borderRadius: '8px',
      padding: '16px 20px',
      marginBottom: '8px',
    }}>
      <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', lineHeight: 1.6 }}>
        Toggle any automation on or off below. Changes take effect immediately on the next scheduled run —
        no redeployment needed. Pausing a cron here does <strong style={{ color: '#e2e8f0' }}>not</strong> stop
        the cron-job.org scheduler from firing — it just makes the route exit early with no action.
        To fully stop a cron from running, disable it in cron-job.org as well.
      </p>
    </div>
  )
}
