import React from 'react'
import Link from 'next/link'

const TextLogo: React.FC = () => (
  <Link href="/" className="text-2xl font-bold text-brand-blue-600">
    Inspiria<span className="text-gray-700 dark:text-gray-300">Digital</span>
  </Link>
)

export default TextLogo
