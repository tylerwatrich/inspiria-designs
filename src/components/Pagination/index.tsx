'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

export const Pagination: React.FC<{
  className?: string
  page: number
  totalPages: number
  basePath?: string
}> = ({ className, page, totalPages, basePath = '/posts' }) => {
  const router = useRouter()

  const hasNextPage = page < totalPages
  const hasPrevPage = page > 1
  const hasExtraPrevPages = page - 1 > 1
  const hasExtraNextPages = page + 1 < totalPages

  const btnBase =
    'flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold transition-all'
  const btnGhost = `${btnBase} text-white/50 hover:text-white hover:bg-white/5`
  const btnActive = `${btnBase} text-white border`

  return (
    <nav
      className={`my-12 flex justify-center items-center gap-1 ${className ?? ''}`}
      aria-label="Pagination"
    >
      {/* Previous */}
      <button
        disabled={!hasPrevPage}
        onClick={() => router.push(`${basePath}/page/${page - 1}`)}
        className={`${btnBase} gap-1.5 px-4 text-[11px] tracking-widest uppercase font-bold text-white/50 hover:text-white hover:bg-white/5 disabled:opacity-20 disabled:cursor-not-allowed`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Prev
      </button>

      {hasExtraPrevPages && (
        <span className="text-white/30 px-1">…</span>
      )}

      {hasPrevPage && (
        <button
          onClick={() => router.push(`${basePath}/page/${page - 1}`)}
          className={btnGhost}
        >
          {page - 1}
        </button>
      )}

      {/* Current page */}
      <button
        aria-current="page"
        onClick={() => router.push(`${basePath}/page/${page}`)}
        className={btnActive}
        style={{ borderColor: 'rgba(0,240,255,0.4)', color: '#00f0ff', background: 'rgba(0,240,255,0.05)' }}
      >
        {page}
      </button>

      {hasNextPage && (
        <button
          onClick={() => router.push(`${basePath}/page/${page + 1}`)}
          className={btnGhost}
        >
          {page + 1}
        </button>
      )}

      {hasExtraNextPages && (
        <span className="text-white/30 px-1">…</span>
      )}

      {/* Next */}
      <button
        disabled={!hasNextPage}
        onClick={() => router.push(`${basePath}/page/${page + 1}`)}
        className={`${btnBase} gap-1.5 px-4 text-[11px] tracking-widest uppercase font-bold text-white/50 hover:text-white hover:bg-white/5 disabled:opacity-20 disabled:cursor-not-allowed`}
      >
        Next
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </nav>
  )
}
