// Full-data print for a processed audit run. Opens a print window and renders
// EVERY row (not the paginated on-screen page), so a saved run reprints completely.
// tableData is the array-of-arrays (header row at index 0).
const ZW = /[​-‍﻿ ⁠᠎]/g

export function printAuditTable(tableData) {
  if (!tableData || tableData.length === 0) return

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
    day: 'numeric',
  })
  const formattedTime = currentDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })

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
                ${row[j] !== undefined && row[j] !== null ? String(row[j]).replace(ZW, '') : ''}
              </td>
            `).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
  `

  // --- SHELF COUNTS LOGIC ---
  const shelfIdx = headers.findIndex(h => String(h).toLowerCase().trim() === 'shelf')
  const shelfCounts = {}
  const shelfLabels = {}
  rows.forEach(row => {
    let shelf = row[shelfIdx] ? String(row[shelfIdx]).replace(ZW, '').trim() : ''
    const shelfKey = shelf.toLowerCase()
    if (!shelfCounts[shelfKey]) {
      shelfCounts[shelfKey] = 0
      shelfLabels[shelfKey] = shelf
    }
    shelfCounts[shelfKey]++
  })
  const shelfStatsHTML = Object.entries(shelfCounts)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([shelfKey, count]) => `
      <div class="stat-item">
        <div class="stat-number">${count}</div>
        <div class="stat-label">${shelfLabels[shelfKey] || 'Unspecified'}</div>
      </div>
    `).join('')

  const printHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>USC Package Audit</title>
      <style>
        @page { margin: 0.75in; size: letter; }
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: white; color: black; line-height: 1.3; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #990000; padding-bottom: 15px; }
        .title { font-size: 24px; font-weight: bold; color: #990000; margin: 0 0 8px 0; letter-spacing: 1px; }
        .subtitle { font-size: 14px; color: #666; margin: 0 0 15px 0; }
        .date-time { font-size: 12px; color: #333; margin: 0; }
        .info-section { display: flex; justify-content: space-between; margin-bottom: 25px; padding: 15px; background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 5px; }
        .info-item { flex: 1; }
        .info-label { font-size: 11px; font-weight: bold; color: #495057; margin-bottom: 5px; }
        .info-value { font-size: 13px; color: #212529; border-bottom: 1px solid #333; padding-bottom: 2px; min-height: 20px; }
        .signature-line { border-bottom: 1px solid #333; min-height: 25px; width: 200px; }
        table { width: 100%; border-collapse: collapse; font-size: 9px; margin-top: 10px; }
        th { border: 1px solid #333; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 10px; background-color: #f0f0f0; }
        td { border: 1px solid #666; padding: 4px 4px; font-size: 8px; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        tr:nth-child(odd) { background-color: white; }
        th:nth-child(1), td:nth-child(1) { width: 40%; }
        th:nth-child(2), td:nth-child(2) { width: 12%; text-align: center; }
        th:nth-child(3), td:nth-child(3) { width: 20%; text-align: center; }
        th:nth-child(4), td:nth-child(4) { width: 28%; }
        .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #666; border-top: 1px solid #ddd; padding-top: 15px; }
        .stats { display: flex; justify-content: center; gap: 30px; margin-top: 15px; }
        .stat-item { text-align: center; }
        .stat-number { font-size: 18px; font-weight: bold; color: #990000; }
        .stat-label { font-size: 10px; color: #666; margin-top: 2px; }
        @media print { body { margin: 0; } .no-print { display: none; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 class="title">USC PACKAGE AUDIT</h1>
        <p class="subtitle">Package Inventory Report</p>
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
          ${shelfStatsHTML}
          <div class="stat-item">
            <div class="stat-number">${rows.length}</div>
            <div class="stat-label">Total Items</div>
          </div>
        </div>
        <p style="margin-top: 20px;">
          USC Housing · Package Auditor | ${currentDate.toLocaleString()}
        </p>
      </div>
    </body>
    </html>
  `

  printWindow.document.write(printHTML)
  printWindow.document.close()

  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }
}
