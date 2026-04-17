import { formatDateTime } from '@/utilities/formatDateTime'
import React from 'react'
import Link from 'next/link'

import type { Post } from '@/payload-types'

import { Media } from '@/components/Media'
import { formatAuthors } from '@/utilities/formatAuthors'

export const PostHero: React.FC<{
  post: Post
}> = ({ post }) => {
  const { categories, heroImage, heroImageUrl, populatedAuthors, publishedAt, title } = post

  const hasAuthors =
    populatedAuthors && populatedAuthors.length > 0 && formatAuthors(populatedAuthors) !== ''

  const hasCategories = categories && categories.length > 0
  const hasHeroImage = (heroImage && typeof heroImage !== 'string') || !!heroImageUrl

  return (
    <div className="pt-36 pb-16">
      <div className="container">
        <div className={hasHeroImage ? 'grid lg:grid-cols-[1fr_420px] gap-12 items-center' : 'grid grid-cols-1'}>

          {/* Left Column */}
          <div className="text-white">
            {/* Back link */}
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 mb-8 group text-white/40 hover:text-cyan-400 transition-colors"
            >
              <svg
                width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                className="transition-transform group-hover:-translate-x-1"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
              <span className="text-sm font-medium tracking-wide">Back to Insights</span>
            </Link>

            {/* Category pills */}
            {hasCategories && (
              <div className="flex flex-wrap gap-2 mb-7">
                {categories?.map((category, index) => {
                  if (typeof category === 'object' && category !== null) {
                    return (
                      <span
                        key={index}
                        className="text-[10px] font-bold uppercase tracking-[0.3em] px-3 py-1.5 rounded-full"
                        style={{
                          background: 'rgba(0,240,255,0.08)',
                          border: '1px solid rgba(0,240,255,0.2)',
                          color: '#00f0ff',
                        }}
                      >
                        {category.title || 'Untitled'}
                      </span>
                    )
                  }
                  return null
                })}
              </div>
            )}

            {/* Title */}
            <h1
              className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight mb-10"
              style={{
                background: 'linear-gradient(180deg, #fff 30%, #94a3b8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {title}
            </h1>

            {/* Author / Date meta */}
            <div
              className="flex flex-col md:flex-row gap-6 md:gap-16 pt-6"
              style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
            >
              {hasAuthors && (
                <div className="flex flex-col gap-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    Author
                  </p>
                  <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>
                    {formatAuthors(populatedAuthors)}
                  </p>
                </div>
              )}
              {publishedAt && (
                <div className="flex flex-col gap-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    Date Published
                  </p>
                  <time dateTime={publishedAt} className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>
                    {formatDateTime(publishedAt)}
                  </time>
                </div>
              )}
            </div>
          </div>

          {/* Right Column — Hero image */}
          {heroImage && typeof heroImage !== 'string' ? (
            <div
              className="relative aspect-[4/3] w-full rounded-3xl overflow-hidden mt-10 lg:mt-0"
              style={{ border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <Media fill priority resource={heroImage} imgClassName="object-cover" />
            </div>
          ) : heroImageUrl ? (
            <div
              className="relative aspect-[4/3] w-full rounded-3xl overflow-hidden mt-10 lg:mt-0"
              style={{ border: '1px solid rgba(255,255,255,0.07)' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={heroImageUrl} alt={title} className="object-cover w-full h-full" />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
