import React, { useState } from 'react'

export default function DataTable({ data }) {
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(25)

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No data to display
      </div>
    )
  }

  const headers = data[0] || []
  const rows = data.slice(1) || []
  
  // Pagination calculations
  const totalRows = rows.length
  const totalPages = Math.ceil(totalRows / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = Math.min(startIndex + rowsPerPage, totalRows)
  const currentRows = rows.slice(startIndex, endIndex)

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage)
    setCurrentPage(1) // Reset to first page
  }

  return (
    <div className="space-y-4">
      {/* Print Header - Only visible when printing */}
      <div className="print-only print-header" style={{ display: 'none' }}>
        <h1 className="print-title">Troy CSC Package Auditor</h1>
        <p className="print-subtitle">Processed Package Data - {new Date().toLocaleDateString()}</p>
      </div>

      {/* Table Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print mb-6">
        <div className="flex items-center space-x-3">
          <label htmlFor="rows-per-page" className="text-sm font-medium text-gray-700">
            Show:
          </label>
          <select
            id="rows-per-page"
            value={rowsPerPage}
            onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
            className="form-select"
          >
            <option value={10}>10 rows</option>
            <option value={25}>25 rows</option>
            <option value={50}>50 rows</option>
            <option value={100}>100 rows</option>
            <option value={totalRows}>All rows</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span>Showing <span className="font-medium text-gray-900">{startIndex + 1}</span> to <span className="font-medium text-gray-900">{endIndex}</span> of <span className="font-medium text-gray-900">{totalRows}</span> entries</span>
        </div>
      </div>

      {/* Table */}
      <div className="table-container print-table-container">
        <div className="table-wrapper">
          <table className="data-table print-table">
            <thead className="table-header">
              <tr>
                {headers.map((header, i) => (
                  <th
                    key={i}
                    className="table-header th"
                    scope="col"
                  >
                    <div className="flex items-center space-x-1">
                      <span>{header || `Column ${i + 1}`}</span>
                      {i === 0 && (
                        <svg className="w-3 h-3 text-gray-400 no-print" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentRows.map((row, i) => (
                <tr
                  key={startIndex + i}
                  className="table-row"
                >
                  {headers.map((_, j) => (
                    <td key={j} className="table-cell">
                      <span className={j === 0 ? 'font-medium text-gray-900' : 'text-gray-700'}>
                        {row[j] !== undefined && row[j] !== null ? String(row[j]) : '—'}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Print Footer - Only visible when printing */}
      <div className="print-only print-footer" style={{ display: 'none' }}>
        <p>Troy CSC Package Auditor - Total Records: {totalRows} - Generated: {new Date().toLocaleString()}</p>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50/50 px-6 py-4 mt-6 rounded-b-xl no-print">
          {/* Mobile Pagination */}
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="pagination-button"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
            <button
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="pagination-button"
            >
              Next
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          {/* Desktop Pagination */}
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">
                Page <span className="font-bold text-troy-red">{currentPage}</span> of <span className="font-bold">{totalPages}</span>
              </span>
            </div>
            
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-lg shadow-sm" aria-label="Pagination">
                {/* Previous button */}
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="pagination-button"
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`pagination-button ${pageNum === currentPage ? 'active' : ''}`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
                
                {/* Next button */}
                <button
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="pagination-button"
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
