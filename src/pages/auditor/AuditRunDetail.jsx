import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PrinterIcon } from '@heroicons/react/24/outline'
import { auditRunsApi } from '../../api/guestCardApi'
import { printAuditTable } from '../../utils/printAudit'
import DataTable from '../../components/DataTable'

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function AuditRunDetail() {
  const { id } = useParams()
  const [run, setRun] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchRun()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const fetchRun = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await auditRunsApi.getById(id)
      setRun(res.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load this audit run.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Link to="/auditor/history" className="text-xs text-slate-500 hover:text-cardinal-700 no-print">← History</Link>
          <h1 className="display-title text-2xl mt-1">{run ? run.fileName : 'Audit run'}</h1>
          {run && (
            <p className="text-sm text-slate-500 mt-1">
              {run.rowCount} rows · saved {formatDate(run.createdAt)}
            </p>
          )}
        </div>
        {run && (
          <button onClick={() => printAuditTable(run.rows)} className="btn-secondary btn-small shrink-0 no-print">
            <PrinterIcon className="h-4 w-4" />
            Print
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16 no-print">
          <div className="loading-spinner" />
        </div>
      ) : error ? (
        <div className="alert alert-error no-print">{error}</div>
      ) : run ? (
        <div className="card">
          <div className="card-content">
            <DataTable data={run.rows} />
          </div>
        </div>
      ) : null}
    </>
  )
}
