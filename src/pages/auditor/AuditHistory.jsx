import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { auditRunsApi } from '../../api/guestCardApi'

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

export default function AuditHistory() {
  const [runs, setRuns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchRuns()
  }, [])

  const fetchRuns = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await auditRunsApi.getAll()
      setRuns(res.data || [])
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load audit history.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="display-title text-2xl">Saved audit runs</h1>
        <p className="text-sm text-slate-500 mt-1">Open a past run to view or reprint it online.</p>
      </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="loading-spinner" />
          </div>
        ) : error ? (
          <div className="alert alert-error">{error}</div>
        ) : runs.length === 0 ? (
          <div className="card">
            <div className="card-content text-center py-16 text-slate-400 text-sm">
              No saved runs yet. Process a file in the Auditor and choose “Save to history.”
            </div>
          </div>
        ) : (
          <div className="table-container">
            <div className="table-wrapper">
              <table className="data-table">
                <thead className="table-header">
                  <tr>
                    <th>File</th>
                    <th>Rows</th>
                    <th>Saved</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map((run) => (
                    <tr key={run._id} className="table-row">
                      <td className="table-cell font-medium text-slate-900">{run.fileName}</td>
                      <td className="table-cell tabular-nums">{run.rowCount ?? '—'}</td>
                      <td className="table-cell text-slate-500">{formatDate(run.createdAt)}</td>
                      <td className="table-cell text-right">
                        <Link to={`/auditor/history/${run._id}`} className="btn-secondary btn-small">
                          Open
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
    </>
  )
}
