import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { notFound } from 'next/navigation'
import { Aurora } from '@/components/Homepage/Aurora'

export const revalidate = 600

type Args = {
  params: Promise<{
    pageNumber: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { pageNumber } = await paramsPromise
  const payload = await getPayload({ config: configPromise })

  const sanitizedPageNumber = Number(pageNumber)
  if (!Number.isInteger(sanitizedPageNumber)) notFound()

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 12,
    page: sanitizedPageNumber,
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
        {posts?.page && posts?.totalPages > 1 && (
          <Pagination page={posts.page} totalPages={posts.totalPages} basePath="/blog" />
        )}
      </div>
    </div>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { pageNumber } = await paramsPromise
  return {
    title: `Insights — Page ${pageNumber}`,
  }
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const { totalDocs } = await payload.count({
    collection: 'posts',
    overrideAccess: false,
  })

  const totalPages = Math.ceil(totalDocs / 10)
  const pages: { pageNumber: string }[] = []
  for (let i = 1; i <= totalPages; i++) {
    pages.push({ pageNumber: String(i) })
  }
  return pages
}
