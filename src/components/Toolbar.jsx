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
    if (!tableData || tableData.length === 0) return

    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600')
    
    if (!printWindow) {
      alert('Please allow popups for this site to enable printing')
      return
    }

    const headers = tableData[0] || []
    const rows = tableData.slice(1) || []
    const currentDate = new Date()
    const formattedDate = currentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    const formattedTime = currentDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })

    // Generate table HTML
    const tableHTML = `
      <table style="width: 100%; border-collapse: collapse; font-size: 9px; margin-top: 20px;">
        <thead>
          <tr style="background-color: #f0f0f0;">
            ${headers.map(header => `
              <th style="border: 1px solid #333; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 10px;">
                ${header || ''}
              </th>
            `).join('')}
          </tr>
        </thead>
        <tbody>
          ${rows.map((row, i) => `
            <tr style="background-color: ${i % 2 === 0 ? '#ffffff' : '#f9f9f9'};">
              ${headers.map((_, j) => `
                <td style="border: 1px solid #666; padding: 4px 4px; font-size: 8px; ${j === 1 || j === 2 ? 'text-align: center;' : ''}">
                  ${row[j] !== undefined && row[j] !== null ? String(row[j]).replace(/[\u200B-\u200D\uFEFF\u00A0\u2060\u180E]/g, '') : ''}
                </td>
              `).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    `

    // Create the complete HTML document
    const printHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Troy CSC Package Audit</title>
        <style>
          @page {
            margin: 0.75in;
            size: letter;
          }
          
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background: white;
            color: black;
            line-height: 1.3;
          }
          
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #990000;
            padding-bottom: 15px;
          }
          
          .title {
            font-size: 24px;
            font-weight: bold;
            color: #990000;
            margin: 0 0 8px 0;
            letter-spacing: 1px;
          }
          
          .subtitle {
            font-size: 14px;
            color: #666;
            margin: 0 0 15px 0;
          }
          
          .date-time {
            font-size: 12px;
            color: #333;
            margin: 0;
          }
          
          .info-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 25px;
            padding: 15px;
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 5px;
          }
          
          .info-item {
            flex: 1;
          }
          
          .info-label {
            font-size: 11px;
            font-weight: bold;
            color: #495057;
            margin-bottom: 5px;
          }
          
          .info-value {
            font-size: 13px;
            color: #212529;
            border-bottom: 1px solid #333;
            padding-bottom: 2px;
            min-height: 20px;
          }
          
          .signature-line {
            border-bottom: 1px solid #333;
            min-height: 25px;
            width: 200px;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9px;
            margin-top: 10px;
          }
          
          th {
            border: 1px solid #333;
            padding: 6px 4px;
            text-align: left;
            font-weight: bold;
            font-size: 10px;
            background-color: #f0f0f0;
          }
          
          td {
            border: 1px solid #666;
            padding: 4px 4px;
            font-size: 8px;
          }
          
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          
          tr:nth-child(odd) {
            background-color: white;
          }
          
          /* Column-specific styling */
          th:nth-child(1), td:nth-child(1) { width: 40%; }
          th:nth-child(2), td:nth-child(2) { width: 12%; text-align: center; }
          th:nth-child(3), td:nth-child(3) { width: 20%; text-align: center; }
          th:nth-child(4), td:nth-child(4) { width: 28%; }
          
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 15px;
          }
          
          .stats {
            display: flex;
            justify-content: center;
            gap: 30px;
            margin-top: 15px;
          }
          
          .stat-item {
            text-align: center;
          }
          
          .stat-number {
            font-size: 18px;
            font-weight: bold;
            color: #990000;
          }
          
          .stat-label {
            font-size: 10px;
            color: #666;
            margin-top: 2px;
          }
          
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">TROY CSC PACKAGE AUDIT</h1>
          <p class="subtitle">Processed Package Inventory Report</p>
          <p class="date-time">${formattedDate} at ${formattedTime}</p>
        </div>
        
        <div class="info-section">
          <div class="info-item">
            <div class="info-label">Audited By:</div>
            <div class="signature-line"></div>
          </div>
          <div class="info-item" style="margin: 0 20px;">
            <div class="info-label">Total Records:</div>
            <div class="info-value">${rows.length}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Date Processed:</div>
            <div class="info-value">${currentDate.toLocaleDateString()}</div>
          </div>
        </div>
        
        ${tableHTML}
        
        <div class="footer">
          <div class="stats">
            <div class="stat-item">
              <div class="stat-number">${rows.filter(row => row[1] && row[1] !== '').length}</div>
              <div class="stat-label">Bin Items</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">${rows.filter(row => !row[1] || row[1] === '').length}</div>
              <div class="stat-label">Other Items</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">${rows.length}</div>
              <div class="stat-label">Total Items</div>
            </div>
          </div>
          <p style="margin-top: 20px;">
            Generated by Troy CSC Package Auditor | ${currentDate.toLocaleString()}
          </p>
        </div>
      </body>
      </html>
    `

    // Write the HTML to the new window
    printWindow.document.write(printHTML)
    printWindow.document.close()

    // Wait for the content to load, then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 250)
    }
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
