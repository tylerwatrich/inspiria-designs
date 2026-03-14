import { formatDateTime } from 'src/utilities/formatDateTime'
import React from 'react'
import Link from 'next/link'

import type { Post } from '@/payload-types'

import { Media } from '@/components/Media'
import { formatAuthors } from '@/utilities/formatAuthors'

export const PostHero: React.FC<{
  post: Post
}> = ({ post }) => {
  const { categories, heroImage, populatedAuthors, publishedAt, title } = post

  const hasAuthors =
    populatedAuthors && populatedAuthors.length > 0 && formatAuthors(populatedAuthors) !== ''

  const hasCategories = categories && categories.length > 0

  return (
    <div className="bg-light-bg dark:bg-zinc-900 pt-8 pb-2">
      <div className="container">
        <div
          className={
            heroImage ? 'grid lg:grid-cols-[1fr_420px] gap-10 items-center' : 'grid grid-cols-1'
          }
        >
          {/* Left Column */}
          <div className="text-gray-800 dark:text-white">
            <Link
              href="/blog"
              className="flex items-center gap-1.5 text-gray-500 dark:text-white/60 hover:text-brand-blue-500 dark:hover:text-white transition-colors mb-6 group"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform group-hover:-translate-x-1"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
              <span className="text-sm font-medium">Back to Blog</span>
            </Link>

            {hasCategories && (
              <div className="flex flex-wrap gap-2 mb-6">
                {categories?.map((category, index) => {
                  if (typeof category === 'object' && category !== null) {
                    const { title: categoryTitle } = category

                    const titleToUse = categoryTitle || 'Untitled category'

                    return (
                      <div
                        key={index}
                        className="bg-brand-blue-500 text-white text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full"
                      >
                        {titleToUse}
                      </div>
                    )
                  }
                  return null
                })}
              </div>
            )}

            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-8">{title}</h1>

            <div className="flex flex-col md:flex-row gap-4 md:gap-16 border-t border-gray-200 dark:border-white/20 pt-6">
              {hasAuthors && (
                <div className="flex flex-col gap-1">
                  <p className="text-gray-400 dark:text-white/50 text-xs uppercase tracking-widest">
                    Author
                  </p>
                  <p>{formatAuthors(populatedAuthors)}</p>
                </div>
              )}
              {publishedAt && (
                <div className="flex flex-col gap-1">
                  <p className="text-gray-400 dark:text-white/50 text-xs uppercase tracking-widest">
                    Date Published
                  </p>
                  <time dateTime={publishedAt}>{formatDateTime(publishedAt)}</time>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          {heroImage && typeof heroImage !== 'string' && (
            <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden shadow-floating-lg mt-10 lg:mt-0">
              <Media fill priority resource={heroImage} imgClassName="object-cover" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
