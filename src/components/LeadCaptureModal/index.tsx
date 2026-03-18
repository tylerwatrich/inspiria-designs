'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface LeadCaptureModalProps {
  triggerLabel: string
  triggerClassName?: string
  source: 'homepage' | 'trade-compass' | 'post'
}

export function LeadCaptureModal({ triggerLabel, triggerClassName, source }: LeadCaptureModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setErrorMsg('Email is required.')
      return
    }
    setStatus('submitting')
    setErrorMsg('')

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, source }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Something went wrong.')
      }

      setStatus('success')
    } catch (err: unknown) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    setName('')
    setEmail('')
    setStatus('idle')
    setErrorMsg('')
  }

  return (
    <>
      <Button className={triggerClassName} onClick={() => setIsOpen(true)}>
        {triggerLabel}
      </Button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        >
          <div
            className="relative bg-white dark:bg-zinc-900 text-gray-800 dark:text-gray-100 rounded-2xl shadow-floating-lg p-8 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {status === 'success' ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-7 h-7 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                  {"You're on the list!"}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {"We'll be in touch shortly. Talk soon!"}
                </p>
                <Button className="mt-6 bg-brand-blue-500 hover:bg-brand-blue-600 text-white" onClick={handleClose}>
                  Close
                </Button>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">
                  {"Let's talk"}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                  Free consultation, no pressure. Drop your info and we&apos;ll reach out.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="lead-name">Name (optional)</Label>
                    <Input
                      id="lead-name"
                      type="text"
                      placeholder="Jane Smith"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="lead-email">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="lead-email"
                      type="email"
                      placeholder="jane@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}

                  <Button
                    type="submit"
                    className="w-full bg-brand-blue-500 hover:bg-brand-blue-600 text-white"
                    disabled={status === 'submitting'}
                  >
                    {status === 'submitting' ? 'Sending...' : 'Get in Touch'}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
