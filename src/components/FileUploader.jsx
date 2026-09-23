import React, { useState, useRef } from 'react'
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline'
import { processExcel } from '../utils/excelUtils'

export default function FileUploader({ onDataProcessed, onFileNameChange, onProcessingChange }) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  const handleFileChange = async (file) => {
    if (!file) return

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ]
    const validExtensions = ['.xlsx', '.xls', '.csv']
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))
    
    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      setError('Please select a valid Excel (.xlsx, .xls) or CSV (.csv) file.')
      return
    }

    // Clear any previous errors
    setError('')
    onProcessingChange(true)
    
    try {
      await processExcel(file, (data) => {
        onDataProcessed(data)
        onFileNameChange(file.name)
        onProcessingChange(false)
      })
    } catch (err) {
      setError('Error processing file. Please check the file format and try again.')
      onProcessingChange(false)
      console.error('File processing error:', err)
    }
  }

  const handleInputChange = (e) => {
    const file = e.target.files[0]
    handleFileChange(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    handleFileChange(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      {/* Drag and Drop Area */}
      <div
        className={`upload-area ${isDragOver ? 'drag-over' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleInputChange}
          className="hidden"
          aria-label="File upload"
        />
        
        <div className="space-y-5">
          <div className="upload-icon">
            <ArrowUpTrayIcon className="w-full h-full" strokeWidth={1.5} />
          </div>

          <div>
            <h3 className="text-base font-semibold text-slate-900 mb-1">
              {isDragOver ? 'Drop your file here' : 'Upload an Excel or CSV file'}
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Drag and drop, or click to browse
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-xs text-slate-500">
              <span className="inline-flex items-center px-2 py-0.5 bg-slate-100 rounded">.xlsx</span>
              <span className="inline-flex items-center px-2 py-0.5 bg-slate-100 rounded">.xls</span>
              <span className="inline-flex items-center px-2 py-0.5 bg-slate-100 rounded">.csv</span>
            </div>
          </div>

          <button
            type="button"
            className="btn-primary"
            onClick={(e) => {
              e.stopPropagation()
              openFileDialog()
            }}
          >
            Browse files
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}
    </div>
  )
}
