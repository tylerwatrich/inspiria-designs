import React from 'react'
import Link from 'next/link'

const TextLogo: React.FC = () => (
  <Link href="/" className="text-xl font-extrabold tracking-tighter text-white uppercase">
    Inspiria<span style={{ color: '#00f0ff' }}>Digital</span>
  </Link>
)

export default TextLogo
