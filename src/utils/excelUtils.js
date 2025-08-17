import * as XLSX from 'xlsx'

/**
 * Process Excel/CSV file according to Troy CSC requirements
 * @param {File} file - The uploaded file
 * @param {Function} callback - Callback function to handle processed data
 * @returns {Promise} - Promise that resolves when processing is complete
 */
export function processExcel(file, callback) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
  reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })

        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          throw new Error('No sheets found in the workbook')
        }

        // Use first sheet
        const sheetName = workbook.SheetNames[0]
        let worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { 
          header: 1,
          defval: '' // Default value for empty cells
        })

        if (!worksheet || worksheet.length === 0) {
          throw new Error('No data found in the worksheet')
        }

        // Ensure we have at least a header row
        if (worksheet.length < 1) {
          throw new Error('File must contain at least a header row')
        }

        // Step 1: Keep all columns initially
        // Original: ['Student/staff', 'Tag #', 'Shelf', 'Tracking Number', 'Mailroom', 'Date Received']

        // Step 2: Remove columns "Tracking Number", "Mailroom", "Date Received" (indices 3, 4, 5)
        worksheet = worksheet.map(row => {
          // Keep only first 3 columns: Student/staff, Tag #, Shelf
          return row.slice(0, 3)
        })

        // Now we should have: Student/staff, Tag #, Shelf

        // Step 3: Remove rows where "Student/staff" column equals "RTS Troy CSC"
        if (worksheet.length > 0) {
          const header = worksheet[0]
          const studentStaffIdx = header.findIndex(h => {
            const headerStr = String(h).toLowerCase().trim()
            return headerStr.includes('student') && headerStr.includes('staff')
          })

          if (studentStaffIdx !== -1) {
            const originalLength = worksheet.length
            worksheet = worksheet.filter((row, index) => {
              if (index === 0) return true // Keep header
              const cellValue = row[studentStaffIdx]
              if (!cellValue) return true
              
              // Clean the cell value by removing all non-printable characters and normalize
              const cleanValue = String(cellValue)
                .replace(/[\u200B-\u200D\uFEFF\u00A0\u2060\u180E]/g, '') // Remove zero-width chars
                .trim()
                .toLowerCase()
              
              const shouldRemove = cleanValue === 'rts troy csc' || 
                                   cleanValue.includes('rts troy csc')
              return !shouldRemove
            })
          }
        }

        // Step 4: Add "Bin No." column as the SECOND column (after Student/staff)
        if (worksheet.length > 0) {
          const header = worksheet[0]
          
          // Insert "Bin No." column at index 1 (after Student/staff)
          header.splice(1, 0, 'Bin No.')
          
          // Find Tag # and Shelf column indices (after inserting Bin No.)
          const tagIdx = header.findIndex(h => {
            const headerStr = String(h).toLowerCase().trim()
            return headerStr.includes('tag') && headerStr.includes('#')
          })
          const shelfIdx = header.findIndex(h => 
            String(h).toLowerCase().trim() === 'shelf'
          )



          // Step 5: Add Bin No. values for data rows
    for (let i = 1; i < worksheet.length; i++) {
            let binValue = ''
            
            if (tagIdx !== -1 && shelfIdx !== -1) {
              // Clean shelf value of invisible characters (same as we did for Student/staff)
              const rawShelfValue = worksheet[i][shelfIdx - 1] || '' // shelfIdx shifted due to inserted column
              const cleanShelfValue = String(rawShelfValue)
                .replace(/[\u200B-\u200D\uFEFF\u00A0\u2060\u180E]/g, '') // Remove zero-width chars
                .trim()
                .toLowerCase()
              
              // Only set bin value if Shelf column value is exactly "BIN"
              if (cleanShelfValue === 'bin') {
                const tagValue = worksheet[i][tagIdx - 1] // tagIdx shifted due to inserted column
                if (tagValue) {
                  const cleanTagValue = String(tagValue)
                    .replace(/[\u200B-\u200D\uFEFF\u00A0\u2060\u180E]/g, '') // Clean tag too
                    .trim()
                  
                  // Get last character if it's a digit
                  const lastChar = cleanTagValue.slice(-1)
                  if (/\d/.test(lastChar)) {
                    binValue = lastChar
                  }
                }
              }
            }
            
            // Insert bin value at index 1
            worksheet[i].splice(1, 0, binValue)
          }
        }

        // Step 6: Sort by Bin Number, then by Shelf column for better organization
        if (worksheet.length > 1) {
          const header = worksheet[0]
          const dataRows = worksheet.slice(1)
          const binIdx = header.findIndex(h => 
            String(h).toLowerCase().trim().includes('bin no')
          )
          const shelfIdx = header.findIndex(h => 
            String(h).toLowerCase().trim() === 'shelf'
          )
          
          const sortedDataRows = dataRows.sort((a, b) => {
            // First sort by bin number (empty bins go to end)
            const aBin = a[binIdx] || ''
            const bBin = b[binIdx] || ''
            
            // If one has bin number and other doesn't
            if (aBin && !bBin) return -1
            if (!aBin && bBin) return 1
            
            // If both have bin numbers, sort numerically
            if (aBin && bBin) {
              const aBinNum = parseInt(aBin) || 0
              const bBinNum = parseInt(bBin) || 0
              if (aBinNum !== bBinNum) {
                return aBinNum - bBinNum
              }
            }
            
            // Then sort by shelf type
            if (shelfIdx !== -1) {
              const aShelf = a[shelfIdx] ? String(a[shelfIdx]).toLowerCase() : ''
              const bShelf = b[shelfIdx] ? String(b[shelfIdx]).toLowerCase() : ''
              return aShelf.localeCompare(bShelf)
            }
            
            return 0
          })
          
          worksheet = [header, ...sortedDataRows]
        }

        // Ensure all rows have the same number of columns
        const maxColumns = Math.max(...worksheet.map(row => row.length))
        worksheet = worksheet.map(row => {
          while (row.length < maxColumns) {
            row.push('')
          }
          return row
        })



        callback(worksheet)
        resolve(worksheet)
      } catch (error) {
        console.error('Error processing Excel file:', error)
        reject(error)
      }
    }

    reader.onerror = () => {
      const error = new Error('Failed to read file')
      console.error('FileReader error:', error)
      reject(error)
    }

    reader.readAsArrayBuffer(file)
  })
}

/**
 * Export processed data to Excel file
 * @param {Array} data - 2D array of processed data
 * @param {string} filename - Name for the exported file
 */
export function exportExcel(data, filename = 'processed_data.xlsx') {
  try {
    if (!data || data.length === 0) {
      throw new Error('No data to export')
    }

    // Create worksheet from array of arrays
    const ws = XLSX.utils.aoa_to_sheet(data)
    
    // Set column widths for better readability
    const colWidths = []
    if (data.length > 0) {
      for (let i = 0; i < data[0].length; i++) {
        let maxWidth = 10
        for (let j = 0; j < Math.min(data.length, 100); j++) { // Check first 100 rows for performance
          const cellValue = data[j][i] ? String(data[j][i]) : ''
          maxWidth = Math.max(maxWidth, Math.min(cellValue.length, 50)) // Cap at 50 characters
        }
        colWidths.push({ wch: maxWidth })
      }
      ws['!cols'] = colWidths
    }

    // Create workbook and add worksheet
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Processed Data')

    // Add metadata
    wb.Props = {
      Title: 'Troy CSC Processed Data',
      Subject: 'Processed Excel Data',
      Author: 'Troy CSC Package Auditor',
      CreatedDate: new Date()
    }

    // Write file
    XLSX.writeFile(wb, filename)
  } catch (error) {
    console.error('Error exporting Excel file:', error)
    throw error
  }
}

/**
 * Group data by shelf type and prepare for PDF export
 * @param {Array} data - 2D array of processed data
 * @returns {Object} - Grouped data by shelf type
 */
export function groupDataByShelf(data) {
  if (!data || data.length <= 1) {
    return {}
  }

  const header = data[0]
  const rows = data.slice(1)
  
  // Find shelf column index
  const shelfIdx = header.findIndex(h => 
    String(h).toLowerCase().trim() === 'shelf'
  )
  
  if (shelfIdx === -1) {
    return { 'Unknown': rows }
  }

  // Group rows by shelf value
  const grouped = {}
  
  rows.forEach(row => {
    const shelfValue = row[shelfIdx] || 'Unknown'
    const shelfKey = String(shelfValue).trim() || 'Unknown'
    
    if (!grouped[shelfKey]) {
      grouped[shelfKey] = []
    }
    
    grouped[shelfKey].push(row)
  })

  return grouped
}