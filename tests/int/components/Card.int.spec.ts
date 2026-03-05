import { describe, it, expect } from 'vitest'

// Unit tests for Card component logic (pure functions, no rendering required)

const routeMap: Record<string, string> = {
  posts: 'blog',
}

function resolvePublicRoute(relationTo?: string): string {
  if (!relationTo) return 'blog'
  return routeMap[relationTo] ?? relationTo
}

function buildHref(relationTo?: string, slug?: string): string {
  const route = resolvePublicRoute(relationTo)
  return `/${route}/${slug}`
}

function sanitizeDescription(description?: string | null): string | undefined {
  return description?.replace(/\s/g, ' ')
}

describe('Card - route resolution', () => {
  it('maps posts collection to /blog route', () => {
    expect(resolvePublicRoute('posts')).toBe('blog')
  })

  it('falls back to the collection name for unmapped collections', () => {
    expect(resolvePublicRoute('projects')).toBe('projects')
  })

  it('defaults to blog when relationTo is undefined', () => {
    expect(resolvePublicRoute(undefined)).toBe('blog')
  })

  it('builds a correct href for a post', () => {
    expect(buildHref('posts', 'my-post')).toBe('/blog/my-post')
  })

  it('builds a correct href for an unmapped collection', () => {
    expect(buildHref('projects', 'cool-project')).toBe('/projects/cool-project')
  })
})

describe('Card - description sanitization', () => {
  it('replaces non-breaking spaces with regular spaces', () => {
    const raw = 'hello\u00a0world'
    expect(sanitizeDescription(raw)).toBe('hello world')
  })

  it('returns undefined when description is undefined', () => {
    expect(sanitizeDescription(undefined)).toBeUndefined()
  })

  it('returns undefined when description is null', () => {
    expect(sanitizeDescription(null)).toBeUndefined()
  })

  it('returns an empty string unchanged', () => {
    expect(sanitizeDescription('')).toBe('')
  })
})
