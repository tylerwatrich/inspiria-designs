'use client'

import { useEffect } from 'react'

export function Aurora() {
  useEffect(() => {
    // Override body background for the aurora design
    const original = document.body.style.backgroundColor
    document.body.style.backgroundColor = '#03050a'

    // Scroll progress bar
    const bar = document.getElementById('aurora-scroll-progress')
    const onScroll = () => {
      const scrolled = document.documentElement.scrollTop
      const max =
        document.documentElement.scrollHeight - document.documentElement.clientHeight
      if (bar && max > 0) bar.style.width = `${(scrolled / max) * 100}%`
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      document.body.style.backgroundColor = original
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <>
      {/* Scroll progress */}
      <div
        id="aurora-scroll-progress"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '2px',
          width: '0%',
          background: '#00f0ff',
          boxShadow: '0 0 10px #00f0ff',
          zIndex: 9999,
          transition: 'none',
          pointerEvents: 'none',
        }}
      />

      {/* Aurora blob — top right, blue */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          top: '-200px',
          right: '-100px',
          width: '700px',
          height: '700px',
          borderRadius: '50%',
          background: '#0055ff',
          filter: 'blur(140px)',
          opacity: 0.35,
          zIndex: -1,
          pointerEvents: 'none',
        }}
      />

      {/* Aurora blob — bottom left, cyan */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          bottom: '-200px',
          left: '-100px',
          width: '700px',
          height: '700px',
          borderRadius: '50%',
          background: '#00f0ff',
          filter: 'blur(140px)',
          opacity: 0.35,
          zIndex: -1,
          pointerEvents: 'none',
        }}
      />

      {/* Aurora blob — center, purple */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          top: '40%',
          left: '30%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: '#6028ff',
          filter: 'blur(140px)',
          opacity: 0.15,
          zIndex: -1,
          pointerEvents: 'none',
        }}
      />
    </>
  )
}
