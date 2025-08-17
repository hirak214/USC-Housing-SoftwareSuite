import React, { useState, useRef } from 'react'
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
        
        <div className="space-y-6">
          {/* Upload Icon */}
          <div className="upload-icon">
            <svg
              className="w-full h-full"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          
          {/* Upload Text */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {isDragOver ? 'Drop your file here' : 'Upload your Excel file'}
            </h3>
            <p className="text-gray-600 mb-4">
              Drag and drop your file here, or click to browse
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-sm text-gray-500">
              <span className="inline-flex items-center px-2 py-1 bg-gray-100 rounded-full">
                .xlsx
              </span>
              <span className="inline-flex items-center px-2 py-1 bg-gray-100 rounded-full">
                .xls
              </span>
              <span className="inline-flex items-center px-2 py-1 bg-gray-100 rounded-full">
                .csv
              </span>
            </div>
          </div>
          
          {/* Browse Button */}
          <button
            type="button"
            className="btn-primary inline-flex items-center space-x-2"
            onClick={(e) => {
              e.stopPropagation()
              openFileDialog()
            }}
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span>Browse Files</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-error animate-fade-in">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="font-medium">Upload Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* File Info Notice */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-gray-600">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Maximum file size: 10MB</span>
          </div>
          <div className="flex items-center text-gray-600">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>100% secure & private</span>
          </div>
        </div>
      </div>
    </div>
  )
}
