import React from 'react'
import { exportExcel } from '../utils/excelUtils'

export default function Toolbar({ tableData, fileName }) {
  const handleDownload = () => {
    if (tableData.length > 0) {
      const processedFileName = fileName
        ? fileName.replace(/\.[^/.]+$/, '_processed.xlsx')
        : 'processed_data.xlsx'
      exportExcel(tableData, processedFileName)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleNewFile = () => {
    window.location.reload()
  }

  return (
    <div className="card animate-fade-in">
      <div className="card-header">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
              <p className="text-sm text-gray-600">Download, print, or process a new file</p>
            </div>
            {fileName && (
              <div className="flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="font-medium">{fileName}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="card-content">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="btn-primary inline-flex items-center space-x-2"
            disabled={!tableData || tableData.length === 0}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span>Download Excel</span>
          </button>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="btn-secondary inline-flex items-center space-x-2"
            disabled={!tableData || tableData.length === 0}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            <span>Print Table</span>
          </button>

          {/* Process New File Button */}
          <button
            onClick={handleNewFile}
            className="btn-outline inline-flex items-center space-x-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
            <span>Process New File</span>
          </button>
        </div>

        {/* Statistics */}
        {tableData && tableData.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="stat-card">
              <div className="stat-number">
                {tableData.length - 1}
              </div>
              <div className="stat-label">Total Rows</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {tableData[0]?.length || 0}
              </div>
              <div className="stat-label">Columns</div>
            </div>
            <div className="stat-card">
              <div className="text-3xl font-bold text-green-500">
                ✓
              </div>
              <div className="stat-label">Processed</div>
            </div>
            <div className="stat-card">
              <div className="text-3xl font-bold text-green-500">
                ✓
              </div>
              <div className="stat-label">Sorted</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
