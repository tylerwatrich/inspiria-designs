'use client'

import React from 'react'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4">
        Something went wrong
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md">
        We encountered an unexpected error. Please try again or contact us if the issue continues.
      </p>
      <button
        onClick={reset}
        className="bg-brand-blue-500 text-white font-bold py-3 px-8 rounded-lg shadow-floating hover:bg-brand-blue-600 transition-all"
      >
        Try again
      </button>
    </div>
  )
}
