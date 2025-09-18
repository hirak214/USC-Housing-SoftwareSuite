import React from 'react'
import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center py-12 px-4">
      <h1 className="text-4xl font-extrabold text-troy-red mb-8 tracking-tight text-center">
        USC Housing Software Suite
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* Troy CSC Package Auditor Widget */}
        <div className="card flex flex-col items-center p-8 shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <div className="mb-4">
            <svg className="w-14 h-14 text-troy-red" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 48 48">
              <rect x="8" y="12" width="32" height="24" rx="4" fill="#FFCC00" stroke="#990000" strokeWidth="2" />
              <path d="M8 20h32" stroke="#990000" strokeWidth="2" />
              <circle cx="16" cy="28" r="2" fill="#990000" />
              <circle cx="24" cy="28" r="2" fill="#990000" />
              <circle cx="32" cy="28" r="2" fill="#990000" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">USC Package Auditor</h2>
          <p className="text-gray-600 text-center mb-6 max-w-xs">
            Upload, process, and audit package data for USC Housing. Generate Excel and print-ready reports with one click.
          </p>
          <Link to="/auditor" className="btn-primary w-full text-center">Open App</Link>
        </div>
        
        {/* Guest Card Inventory System Widget */}
        <div className="card flex flex-col items-center p-8 shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <div className="mb-4">
            <svg className="w-14 h-14 text-troy-red" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 48 48">
              <rect x="8" y="16" width="32" height="20" rx="4" fill="#FFCC00" stroke="#990000" strokeWidth="2" />
              <path d="M8 24h32" stroke="#990000" strokeWidth="2" />
              <circle cx="40" cy="26" r="2" fill="#990000" />
              <path d="M16 28h8" stroke="#990000" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M16 32h12" stroke="#990000" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">USC Guest Card Management</h2>
          <p className="text-gray-600 text-center mb-6 max-w-xs">
            Manage USC guest card requests, assignments, and returns. Complete inventory tracking with audit logs.
          </p>
          <Link 
            to="/guest-card-inventory" 
            className="btn-primary w-full text-center"
          >
            Open App
          </Link>
        </div>
        
        {/* Add more widgets here for future apps */}
      </div>
    </div>
  )
}
