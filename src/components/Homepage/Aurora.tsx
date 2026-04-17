'use client'

import { useEffect } from 'react'

export function Aurora() {
  useEffect(() => {
    // Override body background for the aurora design
    const original = document.body.style.backgroundColor
    document.body.style.backgroundColor = '#03050a'

    return () => {
      document.body.style.backgroundColor = original
    }
  }, [])

  return (
    <>
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
