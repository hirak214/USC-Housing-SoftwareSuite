import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowDownTrayIcon,
  PrinterIcon,
  ArrowPathIcon,
  CloudArrowUpIcon,
  CheckIcon,
} from '@heroicons/react/24/outline'
import { exportExcel } from '../utils/excelUtils'
import { printAuditTable } from '../utils/printAudit'
import { auditRunsApi } from '../api/guestCardApi'

export default function Toolbar({ tableData, fileName }) {
  const [saveState, setSaveState] = useState('idle') // idle | saving | saved | error
  const [saveError, setSaveError] = useState('')
  const [savedId, setSavedId] = useState(null)

  const hasData = tableData && tableData.length > 0

  const handleDownload = () => {
    if (hasData) {
      const processedFileName = fileName
        ? fileName.replace(/\.[^/.]+$/, '_processed.xlsx')
        : 'processed_data.xlsx'
      exportExcel(tableData, processedFileName)
    }
  }

  const handleSave = async () => {
    if (!hasData) return
    try {
      setSaveState('saving')
      setSaveError('')
      const res = await auditRunsApi.create({
        fileName: fileName || 'Untitled',
        rows: tableData,
      })
      setSavedId(res.data?._id || null)
      setSaveState('saved')
    } catch (err) {
      setSaveError(err.response?.data?.error || 'Could not save this run.')
      setSaveState('error')
    }
  }

  const handlePrint = () => printAuditTable(tableData)

  const handleNewFile = () => {
    window.location.reload()
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-base font-semibold text-slate-900">Actions</h3>
          {fileName && (
            <span className="badge badge-neutral max-w-[16rem] truncate" title={fileName}>
              {fileName}
            </span>
          )}
        </div>
      </div>

      <div className="card-content">
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={handleDownload} className="btn-primary" disabled={!hasData}>
            <ArrowDownTrayIcon className="h-5 w-5" />
            Download Excel
          </button>

          <button
            onClick={handleSave}
            className="btn-secondary"
            disabled={!hasData || saveState === 'saving' || saveState === 'saved'}
          >
            {saveState === 'saved' ? (
              <>
                <CheckIcon className="h-5 w-5 text-emerald-600" />
                Saved
              </>
            ) : (
              <>
                <CloudArrowUpIcon className="h-5 w-5" />
                {saveState === 'saving' ? 'Saving…' : 'Save to history'}
              </>
            )}
          </button>

          <button onClick={handlePrint} className="btn-secondary" disabled={!hasData}>
            <PrinterIcon className="h-5 w-5" />
            Print
          </button>

          <button onClick={handleNewFile} className="btn-ghost">
            <ArrowPathIcon className="h-5 w-5" />
            New file
          </button>
        </div>

        {saveState === 'saved' && (
          <div className="alert alert-success mt-4 flex items-center justify-between gap-4">
            <span>Saved to history.</span>
            <Link
              to={savedId ? `/auditor/history/${savedId}` : '/auditor/history'}
              className="font-medium underline underline-offset-2"
            >
              View
            </Link>
          </div>
        )}
        {saveState === 'error' && (
          <div className="alert alert-error mt-4">{saveError}</div>
        )}

        {hasData && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            <div className="stat-card">
              <div className="stat-number">{tableData.length - 1}</div>
              <div className="stat-label">Rows</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{tableData[0]?.length || 0}</div>
              <div className="stat-label">Columns</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
