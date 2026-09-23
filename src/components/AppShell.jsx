import React from 'react'
import AppSidebar from './AppSidebar'
import Footer from './Footer'

// Per-app shell: each app passes its OWN scoped sidebar nav + brand title.
export default function AppShell({ children, sections, brandTitle, maxWidth = 'max-w-none' }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <AppSidebar sections={sections} brandTitle={brandTitle} />
      <div className="md:pl-64 print:!pl-0 min-h-screen flex flex-col">
        <main className="flex-1">
          <div className={`${maxWidth} mx-auto px-4 sm:px-6 py-8`}>{children}</div>
        </main>
        <Footer />
      </div>
    </div>
  )
}
