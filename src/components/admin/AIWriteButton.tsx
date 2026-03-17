'use client'

import { useState } from 'react'
import { useField } from '@payloadcms/ui'
import type { ArticleJSON } from '@/lib/aiWriter'
import { toLexical } from '@/lib/toLexical'

export function AIWriteButton() {
  const [loading, setLoading] = useState(false)
  const [topic, setTopic] = useState('')
  const [error, setError] = useState('')

  const { setValue: setTitle } = useField<string>({ path: 'title' })
  const { setValue: setSlug } = useField<string>({ path: 'slug' })
  const { setValue: setContent } = useField<object>({ path: 'content' })

  async function handleGenerate() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/ai-write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim() || undefined }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      const article: ArticleJSON = data.article
      setTitle(article.title)
      setSlug(article.slug)
      setContent(toLexical(article.content))
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      background: '#1a1a2e', border: '1px solid #2d2d5e', borderRadius: '8px',
      padding: '16px 20px', marginBottom: '24px', display: 'flex',
      flexDirection: 'column', gap: '12px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '14px', fontWeight: 600, color: '#a78bfa' }}>✦ AI Write</span>
        <span style={{ fontSize: '12px', color: '#6b7280' }}>Generate a full article with Claude</span>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          placeholder="Optional topic or leave blank for auto-pick..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          style={{
            flex: 1, background: '#0f0f1a', border: '1px solid #2d2d5e',
            borderRadius: '6px', padding: '8px 12px', color: '#e5e7eb',
            fontSize: '13px', outline: 'none',
          }}
        />
        <button
          onClick={handleGenerate}
          disabled={loading}
          style={{
            background: loading ? '#374151' : '#6d28d9', color: '#fff', border: 'none',
            borderRadius: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap',
          }}
        >
          {loading ? 'Writing...' : 'Generate Article'}
        </button>
      </div>
      {error && <div style={{ fontSize: '12px', color: '#f87171' }}>Error: {error}</div>}
    </div>
  )
}
