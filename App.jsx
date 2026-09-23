import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './src/components/Home'
import FileUploader from './src/components/FileUploader'
import DataTable from './src/components/DataTable'
import Toolbar from './src/components/Toolbar'
import AppShell from './src/components/AppShell'
import { AUDITOR_NAV, GUEST_NAV } from './src/components/AppSidebar'
import AuditHistory from './src/pages/auditor/AuditHistory'
import AuditRunDetail from './src/pages/auditor/AuditRunDetail'

// Guest Card Inventory Components
import RequestCard from './src/pages/guestCard/RequestCard'
import PendingRequests from './src/pages/guestCard/PendingRequests'
import AssignCard from './src/pages/guestCard/AssignCard'
import ReturnCard from './src/pages/guestCard/ReturnCard'
import CardManagement from './src/pages/guestCard/CardManagement'
import Logs from './src/pages/guestCard/Logs'
import GuestCardQRCode from './src/pages/guestCard/QRCode'
import PublicRequestCard from './src/pages/guestCard/PublicRequestCard'

function AuditorApp() {
  const [tableData, setTableData] = React.useState([])
  const [fileName, setFileName] = React.useState('')
  const [isProcessing, setIsProcessing] = React.useState(false)

  return (
    <AppShell sections={AUDITOR_NAV} brandTitle="Package Auditor">
      <div className="mb-6">
        <h1 className="display-title text-2xl">Package Auditor</h1>
        <p className="text-sm text-slate-500 mt-1">Turn a notifi export into an audit-ready package list.</p>
      </div>

      <div className="space-y-6">
        {/* File Upload Section */}
        <div className="card">
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
          <div className="card">
            <div className="card-content">
              <div className="flex items-center justify-center gap-3 py-2">
                <div className="loading-spinner"></div>
                <span className="text-sm font-medium text-slate-600">Processing your file…</span>
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        {tableData.length > 0 && !isProcessing && (
          <>
            <div className="no-print">
              <Toolbar tableData={tableData} fileName={fileName} />
            </div>
            <div className="card">
              <div className="card-header">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-base font-semibold text-slate-900">Processed data</h2>
                  <span className="badge badge-neutral">{tableData.length - 1} rows</span>
                </div>
              </div>
              <div className="card-content">
                <DataTable data={tableData} />
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  )
}

function GuestCardInventoryApp() {
  return (
    <AppShell sections={GUEST_NAV} brandTitle="Guest Cards">
      <Routes>
        <Route path="" element={<RequestCard />} />
        <Route path="pending" element={<PendingRequests />} />
        <Route path="assign/:requestId" element={<AssignCard />} />
        <Route path="return" element={<ReturnCard />} />
        <Route path="management" element={<CardManagement />} />
        <Route path="qr-code" element={<GuestCardQRCode />} />
        <Route path="logs" element={<Logs />} />
      </Routes>
    </AppShell>
  )
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auditor" element={<AuditorApp />} />
        <Route path="/auditor/history" element={<AppShell sections={AUDITOR_NAV} brandTitle="Package Auditor"><AuditHistory /></AppShell>} />
        <Route path="/auditor/history/:id" element={<AppShell sections={AUDITOR_NAV} brandTitle="Package Auditor" maxWidth="max-w-6xl"><AuditRunDetail /></AppShell>} />
        <Route path="/guest-card-inventory/*" element={<GuestCardInventoryApp />} />
        <Route path="/request-card" element={<PublicRequestCard />} />
      </Routes>
    </Router>
  )
}
