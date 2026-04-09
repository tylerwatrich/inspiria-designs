import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { Aurora } from '@/components/Homepage/Aurora'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function Page() {
  const payload = await getPayload({ config: configPromise })

  const posts = await payload.find({
    collection: 'posts',
    depth: 2,
    limit: 12,
    overrideAccess: false,
    select: {
      title: true,
      slug: true,
      categories: true,
      meta: true,
      heroImage: true,
    },
  })

  return (
    <div className="min-h-screen pb-24" style={{ color: '#fff' }}>
      <Aurora />

      {/* Hero */}
      <div className="container pt-40 mb-16 text-center">
        <div
          className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border border-white/10 text-[10px] tracking-[0.3em] font-bold uppercase mb-8"
          style={{ background: 'rgba(255,255,255,0.05)', color: '#00f0ff' }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: '#00f0ff' }}
          />
          <span>Canadian Business Insights</span>
        </div>

        <h1
          className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6"
          style={{
            background: 'linear-gradient(180deg, #fff 30%, #94a3b8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          The Latest from <br />Canadian Business
        </h1>

        <p className="text-lg max-w-2xl mx-auto" style={{ color: '#94a3b8' }}>
          News, trends, and analysis shaping Canadian business today.
        </p>
      </div>

      {/* Page range */}
      <div className="container mb-10 text-sm" style={{ color: '#64748b' }}>
        <PageRange
          collection="posts"
          currentPage={posts.page}
          limit={12}
          totalDocs={posts.totalDocs}
        />
      </div>

      <CollectionArchive posts={posts.docs} />

      <div className="container mt-12">
        {posts.totalPages > 1 && posts.page && (
          <Pagination page={posts.page} totalPages={posts.totalPages} basePath="/blog" />
        )}
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: 'Insights — Canadian Business News',
    description: 'The latest news, trends, and analysis shaping Canadian business today.',
  }
}
