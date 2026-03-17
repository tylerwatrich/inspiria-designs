'use client'

import { useState } from 'react'
import { useField, useDocumentInfo } from '@payloadcms/ui'

export function GenerateImageButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const { id } = useDocumentInfo()
  // heroImage is an upload field — its value is the media ID (or object) when set
  const { value: heroImage } = useField<string | object>({ path: 'heroImage' })

  const hasImage = Boolean(heroImage)
  const disabled = hasImage || loading || !id

  async function handleGenerate() {
    if (disabled) return
    setLoading(true)
    setError('')
    setSuccess(false)
    try {
      const res = await fetch('/api/admin/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Unknown error')
      setSuccess(true)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      background: '#0f1a1a', border: `1px solid ${hasImage ? '#1f3a2a' : '#1a3333'}`,
      borderRadius: '8px', padding: '14px 16px', marginBottom: '16px',
      display: 'flex', flexDirection: 'column', gap: '8px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: hasImage ? '#6b7280' : '#34d399' }}>
            ✦ Flux Image
          </span>
          <span style={{ fontSize: '12px', color: '#6b7280' }}>
            {hasImage ? 'Hero image saved to media' : 'Generate AI header image via BFL Flux'}
          </span>
        </div>
        <button
          onClick={handleGenerate}
          disabled={disabled}
          style={{
            background: disabled ? '#1f2937' : '#065f46',
            color: disabled ? '#6b7280' : '#d1fae5',
            border: 'none', borderRadius: '6px', padding: '7px 14px',
            fontSize: '13px', fontWeight: 600,
            cursor: disabled ? 'not-allowed' : 'pointer',
            whiteSpace: 'nowrap', flexShrink: 0,
          }}
        >
          {loading ? 'Generating…' : hasImage ? 'Already generated' : 'Generate Image'}
        </button>
      </div>
      {success && !error && (
        <div style={{ fontSize: '12px', color: '#34d399' }}>
          Image generated and saved to media — refresh the page to see it.
        </div>
      )}
      {error && (
        <div style={{ fontSize: '12px', color: '#f87171' }}>Error: {error}</div>
      )}
    </div>
  )
}
