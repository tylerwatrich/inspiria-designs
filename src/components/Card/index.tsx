'use client'

import { cn } from '@/utilities/ui'
import useClickableCard from '@/utilities/useClickableCard'
import Link from 'next/link'
import React, { Fragment } from 'react'

import type { Post } from '@/payload-types'
import { Media } from '@/components/Media'

export type CardPostData = Pick<Post, 'slug' | 'categories' | 'meta' | 'title' | 'heroImage'>

export const Card: React.FC<{
  alignItems?: 'center'
  className?: string
  doc?: CardPostData
  relationTo?: 'posts'
  showCategories?: boolean
  title?: string
}> = (props) => {
  const { card, link } = useClickableCard({})
  const { className, doc, relationTo, showCategories, title: titleFromProps } = props

  const { slug, categories, meta, title, heroImage } = doc || {}
  const { description, image: metaImage } = meta || {}
  const cardImage =
    (heroImage && typeof heroImage === 'object' ? heroImage : null) ??
    (metaImage && typeof metaImage === 'object' ? metaImage : null)

  const hasCategories = categories && Array.isArray(categories) && categories.length > 0
  const titleToUse = titleFromProps || title
  const sanitizedDescription = description?.replace(/\s/g, ' ')

  const routeMap: Record<string, string> = { posts: 'blog' }
  const publicRoute = relationTo ? routeMap[relationTo] || relationTo : 'blog'
  const href = `/${publicRoute}/${slug}`

  return (
    <article
      className={cn('group overflow-hidden hover:cursor-pointer flex flex-col', className)}
      ref={card.ref}
      style={{
        background: 'rgba(255,255,255,0.02)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '24px',
        transition: 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget
        el.style.border = '1px solid rgba(0,240,255,0.3)'
        el.style.transform = 'translateY(-8px)'
        el.style.boxShadow = '0 20px 40px rgba(0,0,0,0.4), 0 0 20px rgba(0,240,255,0.05)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget
        el.style.border = '1px solid rgba(255,255,255,0.07)'
        el.style.transform = 'translateY(0)'
        el.style.boxShadow = 'none'
      }}
    >
      {/* Image */}
      <div className="relative w-full aspect-video overflow-hidden rounded-t-[24px] flex-shrink-0">
        {cardImage ? (
          <Media resource={cardImage} size="33vw" fill={true} imgClassName="object-cover group-hover:scale-105 transition-transform duration-700" />
        ) : (
          <div
            className="w-full h-full"
            style={{ background: 'rgba(255,255,255,0.03)' }}
          />
        )}
      </div>

      {/* Body */}
      <div className="p-7 flex flex-col flex-1">
        {showCategories && hasCategories && (
          <div className="mb-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: '#00f0ff' }}>
              {categories?.map((category, index) => {
                if (typeof category === 'object') {
                  const { title: titleFromCategory } = category
                  const isLast = index === (categories as unknown[]).length - 1
                  return (
                    <Fragment key={index}>
                      {titleFromCategory || 'Untitled'}
                      {!isLast && ', '}
                    </Fragment>
                  )
                }
                return null
              })}
            </span>
          </div>
        )}

        {titleToUse && (
          <h3 className="text-lg font-bold mb-3 leading-snug flex-1">
            <Link
              className="text-white hover:text-cyan-400 transition-colors"
              href={href}
              ref={link.ref}
            >
              {titleToUse}
            </Link>
          </h3>
        )}

        {sanitizedDescription && (
          <p className="text-sm line-clamp-3" style={{ color: '#94a3b8' }}>
            {sanitizedDescription}
          </p>
        )}

        {/* Read more arrow */}
        <div className="mt-5 flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase" style={{ color: '#00f0ff' }}>
          <span>Read Article</span>
          <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </article>
  )
}
