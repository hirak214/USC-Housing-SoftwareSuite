import React from 'react'
import { Link } from 'react-router-dom'
import { ArchiveBoxIcon, CreditCardIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import Footer from './Footer'

const apps = [
  {
    to: '/auditor',
    icon: ArchiveBoxIcon,
    title: 'Package Auditor',
    desc: 'Process notifi exports into an audit-ready package list, then save and reprint past runs.',
  },
  {
    to: '/guest-card-inventory',
    icon: CreditCardIcon,
    title: 'Guest Card Management',
    desc: 'Handle guest card requests, assignments, returns, and the full activity log.',
  },
]

function AppCard({ to, icon: Icon, title, desc }) {
  return (
    <Link
      to={to}
      className="group card p-5 flex flex-col gap-4 hover:border-slate-300 hover:shadow-card-hover transition-all duration-150"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-cardinal-50 text-cardinal-600">
          <Icon className="h-5 w-5" />
        </div>
        <ArrowRightIcon className="h-4 w-4 text-slate-300 group-hover:text-cardinal-600 transition-colors duration-150" />
      </div>
      <div>
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-500 mt-1">{desc}</p>
      </div>
    </Link>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar */}
      <header className="app-header">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
          <img
            src="/usc-logo-wordmark.jpg"
            alt="University of Southern California"
            className="h-8 w-auto mix-blend-multiply"
          />
          <span className="hidden sm:block h-6 w-px bg-slate-200" />
          <span className="app-title text-lg">USC Housing Software Suite</span>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="mb-6">
            <h1 className="text-base font-semibold text-slate-900">Applications</h1>
            <p className="text-sm text-slate-500 mt-0.5">Choose a tool to get started.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {apps.map((app) => (
              <AppCard key={app.to} {...app} />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
