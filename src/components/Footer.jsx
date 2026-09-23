import React from 'react'
import { HeartIcon } from '@heroicons/react/24/solid'
import { EnvelopeIcon } from '@heroicons/react/24/outline'

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <p>© 2026 USC Housing Software Suite</p>
        <a
          href="mailto:hadesai@usc.edu?subject=Feature%20request"
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 font-medium text-slate-600 transition-colors hover:border-cardinal-300 hover:text-cardinal-700"
        >
          <EnvelopeIcon className="h-3.5 w-3.5" />
          Send an email for any feature request.
        </a>
        <p className="inline-flex items-center gap-1">
          Built with
          <HeartIcon className="h-3.5 w-3.5 text-cardinal-600" aria-label="love" />
          for USC by{' '}
          <a
            href="mailto:hadesai@usc.edu"
            className="font-medium text-slate-700 hover:text-cardinal-700"
          >
            Hirak
          </a>
        </p>
      </div>
    </footer>
  )
}
