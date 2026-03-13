import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import PageClient from './page.client'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function Page() {
  const payload = await getPayload({ config: configPromise })
  console.log('BLOG')
  console.log('Server URL env:', process.env.NEXT_PUBLIC_SERVER_URL)

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
    <div className="bg-light-bg dark:bg-zinc-900 min-h-screen pb-24">
      <PageClient />

      {/* Hero header */}
      <div className="container pt-24 mb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-200 mb-4">
          Canadian Business <span className="text-brand-blue-500">Insights</span>
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          The latest news, trends, and analysis shaping Canadian business today.
        </p>
      </div>

      <div className="container mb-8 text-sm text-gray-500 dark:text-gray-400">
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
    title: 'Blog',
    description: 'Read the latest articles and updates on our blog.',
  }
}
