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
  const cardImage = (heroImage && typeof heroImage === 'object' ? heroImage : null) ?? (metaImage && typeof metaImage === 'object' ? metaImage : null)

  const hasCategories = categories && Array.isArray(categories) && categories.length > 0
  const titleToUse = titleFromProps || title
  const sanitizedDescription = description?.replace(/\s/g, ' ') // replace non-breaking space with white space
  // Map Payload collection slugs -> frontend route segments
  // Convert Payload collection slugs to public-facing routes
  const routeMap: Record<string, string> = {
    posts: 'blog', // map the 'posts' collection to the '/blog' route
  }

  const publicRoute = relationTo ? routeMap[relationTo] || relationTo : 'blog'
  const href = `/${publicRoute}/${slug}`

  return (
    <article
      className={cn(
        'bg-white dark:bg-zinc-800 rounded-2xl shadow-floating card overflow-hidden hover:cursor-pointer',
        className,
      )}
      ref={card.ref}
    >
      <div className="relative w-full aspect-video">
        {cardImage ? (
          <Media resource={cardImage} size="33vw" fill={true} imgClassName="object-cover" />
        ) : (
          <div className="w-full h-full bg-muted" />
        )}
      </div>
      <div className="p-6">
        {showCategories && hasCategories && (
          <div className="mb-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-brand-blue-500">
              {categories?.map((category, index) => {
                if (typeof category === 'object') {
                  const { title: titleFromCategory } = category
                  const categoryTitle = titleFromCategory || 'Untitled category'
                  const isLast = index === categories.length - 1
                  return (
                    <Fragment key={index}>
                      {categoryTitle}
                      {!isLast && <Fragment>, &nbsp;</Fragment>}
                    </Fragment>
                  )
                }
                return null
              })}
            </div>
          </div>
        )}
        {titleToUse && (
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2 leading-snug">
            <Link className="hover:text-brand-blue-500 transition-colors" href={href} ref={link.ref}>
              {titleToUse}
            </Link>
          </h3>
        )}
        {description && (
          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">{sanitizedDescription}</p>
        )}
      </div>
    </article>
  )
}
