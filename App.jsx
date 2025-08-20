import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './src/components/Home'
import FileUploader from './src/components/FileUploader'
import DataTable from './src/components/DataTable'
import Toolbar from './src/components/Toolbar'

// Guest Card Inventory Components
import GuestCardNavbar from './src/components/guestCard/Navbar'
import RequestCard from './src/pages/guestCard/RequestCard'
import PendingRequests from './src/pages/guestCard/PendingRequests'
import AssignCard from './src/pages/guestCard/AssignCard'
import ReturnCard from './src/pages/guestCard/ReturnCard'
import Logs from './src/pages/guestCard/Logs'
import PublicRequestCard from './src/pages/guestCard/PublicRequestCard'

function AuditorApp() {
  const [tableData, setTableData] = React.useState([])
  const [fileName, setFileName] = React.useState('')
  const [isProcessing, setIsProcessing] = React.useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="app-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center animate-fade-in">
            <h1 className="app-title mb-4" style={{ fontSize: '2.5rem' }}>
              Troy CSC Package Auditor
            </h1>
            <p className="app-subtitle max-w-3xl mx-auto leading-relaxed">
              Troy CSC Package Auditor is a tool that helps you create a list of packages that need to be audited.
            </p>
            <div className="mt-6 flex justify-center">
              <div className="inline-flex items-center px-4 py-2 bg-troy-gold/10 text-troy-red rounded-full text-sm font-medium">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                100% Client-Side Processing • Secure & Private
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* File Upload Section */}
          <div className="card animate-fade-in">
            <div className="card-content">
              <FileUploader 
                onDataProcessed={setTableData}
                onFileNameChange={setFileName}
                onProcessingChange={setIsProcessing}
              />
            </div>
          </div>
          {/* Processing Status */}
          {isProcessing && (
            <div className="card animate-fade-in shadow-glow">
              <div className="card-content">
                <div className="flex items-center justify-center space-x-4">
                  <div className="loading-spinner"></div>
                  <div>
                    <span className="text-gray-800 font-medium">Processing your file</span>
                    <span className="loading-dots text-troy-red"></span>
                    <div className="progress-bar mt-2">
                      <div className="progress-fill w-3/4"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Results Section */}
          {tableData.length > 0 && !isProcessing && (
            <>
              {/* Toolbar */}
              <div className="no-print">
                <Toolbar 
                  tableData={tableData} 
                  fileName={fileName}
                />
              </div>
              {/* Data Table */}
              <div className="card animate-fade-in">
                <div className="card-header">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        Processed Data
                      </h2>
                      <p className="text-gray-600 mt-1">
                        Your Excel file has been successfully processed
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold gradient-text">
                        {tableData.length - 1}
                      </span>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        Data Rows
                      </p>
                    </div>
                  </div>
                </div>
                <div className="card-content">
                  <DataTable data={tableData} />
                </div>
              </div>
            </>
          )}
          {/* Instructions */}
          {tableData.length === 0 && !isProcessing && (
            <div className="card animate-slide-in">
              <div className="card-header">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  How it works
                </h2>
                <p className="text-gray-600">
                  Automated processing of notifi exported excel file to create a list of packages that need to be audited.
                </p>
              </div>
              <div className="card-content">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    {/* ...instructions... */}
                  </div>
                  <div>
                    {/* ...instructions... */}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <footer className="app-footer mt-20 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              &copy; 2024 Troy CSC Auto. Built with ❤️ for efficient data processing.
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Secure client-side processing • No data leaves your device
            </p>
            <p className="text-gray-500 text-xs mt-2">
              For any questions or support, please contact us at <a href="mailto:hirak214@gmail.com" className="text-troy-red">Hirak Desai</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function GuestCardInventoryApp() {
  return (
    <div className="min-h-screen bg-gray-50">
      <GuestCardNavbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="" element={<RequestCard />} />
          <Route path="pending" element={<PendingRequests />} />
          <Route path="assign/:requestId" element={<AssignCard />} />
          <Route path="return" element={<ReturnCard />} />
          <Route path="logs" element={<Logs />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auditor" element={<AuditorApp />} />
        <Route path="/guest-card-inventory/*" element={<GuestCardInventoryApp />} />
        <Route path="/request-card" element={<PublicRequestCard />} />
      </Routes>
    </Router>
  )
}
