import Link from 'next/link'
import type { Post, Category, Media } from '@/payload-types'

type NewsFeedPost = Pick<Post, 'title' | 'slug' | 'publishedAt' | 'articleSummary'> & {
  categories?: (number | Category)[] | null
  heroImage?: (number | null) | Media
  heroImageUrl?: string | null
}

interface NewsFeedProps {
  posts: NewsFeedPost[]
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function NewsFeed({ posts }: NewsFeedProps) {
  if (!posts.length) return null

  return (
    <section className="min-h-screen flex flex-col justify-center px-6 pt-32 pb-20">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-12">
          <p
            className="text-xs font-bold tracking-[0.4em] uppercase mb-4"
            style={{ color: '#06b6d4' }}
          >
            Latest News
          </p>
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
              Canadian Business Insights
            </h2>
            <Link
              href="/blog"
              className="shrink-0 text-sm font-semibold transition-colors"
              style={{ color: '#06b6d4' }}
            >
              View all →
            </Link>
          </div>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {posts.map((post) => {
            const category =
              post.categories?.[0] && typeof post.categories[0] === 'object'
                ? (post.categories[0] as Category)
                : null

            const imageUrl =
              post.heroImageUrl ??
              (post.heroImage && typeof post.heroImage === 'object'
                ? (post.heroImage as Media).url
                : null)

            return (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl transition-transform duration-300 hover:-translate-y-1"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                {/* Image */}
                <div
                  className="h-44 overflow-hidden relative"
                  style={{ background: 'rgba(6,182,212,0.06)' }}
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg
                        className="w-10 h-10 opacity-20"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l6 6v8a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 p-6 gap-3">
                  {/* Category + date */}
                  <div className="flex items-center justify-between gap-2">
                    {category && (
                      <span
                        className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                        style={{
                          background: 'rgba(6,182,212,0.12)',
                          color: '#06b6d4',
                        }}
                      >
                        {category.title}
                      </span>
                    )}
                    {post.publishedAt && (
                      <span className="text-xs ml-auto" style={{ color: '#64748b' }}>
                        {formatDate(post.publishedAt)}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3
                    className="font-bold text-base leading-snug text-white transition-colors group-hover:text-cyan-300"
                    style={{ lineClamp: 2 } as React.CSSProperties}
                  >
                    {post.title}
                  </h3>

                  {/* Summary */}
                  {post.articleSummary && (
                    <p
                      className="text-sm leading-relaxed line-clamp-3"
                      style={{ color: '#94a3b8' }}
                    >
                      {post.articleSummary}
                    </p>
                  )}

                  {/* Read more */}
                  <span
                    className="mt-auto pt-2 text-xs font-semibold uppercase tracking-widest transition-colors group-hover:text-cyan-300"
                    style={{ color: '#475569' }}
                  >
                    Read more →
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
