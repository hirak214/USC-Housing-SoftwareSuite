import React, { useState } from 'react'
import FileUploader from './src/components/FileUploader'
import DataTable from './src/components/DataTable'
import Toolbar from './src/components/Toolbar'

function App() {
  const [tableData, setTableData] = useState([])
  const [fileName, setFileName] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="app-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center animate-fade-in">
            <h1 className="app-title mb-4" style={{ fontSize: '2.5rem' }}>
              Troy CSC Package Auditor
            </h1>
            <p className="app-subtitle max-w-3xl mx-auto leading-relaxed">
              Troy CSC Package Auditor is a tool that helps you create a list of packages that need to be audited.
            </p>
            <div className="mt-6 flex justify-center">
              <div className="inline-flex items-center px-4 py-2 bg-troy-gold/10 text-troy-red rounded-full text-sm font-medium">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                100% Client-Side Processing • Secure & Private
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* File Upload Section */}
          <div className="card animate-fade-in">
            {/* <div className="card-header">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Upload Excel File
              </h2>
              <p className="text-gray-600">
                Drag and drop your Excel or CSV file to get started
              </p>
            </div> */}
            <div className="card-content">
              <FileUploader 
                onDataProcessed={setTableData}
                onFileNameChange={setFileName}
                onProcessingChange={setIsProcessing}
              />
            </div>
          </div>

          {/* Processing Status */}
          {isProcessing && (
            <div className="card animate-fade-in shadow-glow">
              <div className="card-content">
                <div className="flex items-center justify-center space-x-4">
                  <div className="loading-spinner"></div>
                  <div>
                    <span className="text-gray-800 font-medium">Processing your file</span>
                    <span className="loading-dots text-troy-red"></span>
                    <div className="progress-bar mt-2">
                      <div className="progress-fill w-3/4"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results Section */}
          {tableData.length > 0 && !isProcessing && (
            <>
              {/* Toolbar */}
              <div className="no-print">
                <Toolbar 
                  tableData={tableData} 
                  fileName={fileName}
                />
              </div>

              {/* Data Table */}
              <div className="card animate-fade-in">
                <div className="card-header">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        Processed Data
                      </h2>
                      <p className="text-gray-600 mt-1">
                        Your Excel file has been successfully processed
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold gradient-text">
                        {tableData.length - 1}
                      </span>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        Data Rows
                      </p>
                    </div>
                  </div>
                </div>
                <div className="card-content">
                  <DataTable data={tableData} />
                </div>
              </div>
            </>
          )}

          {/* Instructions */}
          {tableData.length === 0 && !isProcessing && (
            <div className="card animate-slide-in">
              <div className="card-header">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  How it works
                </h2>
                <p className="text-gray-600">
                  Automated processing of notifi exported excel file to create a list of packages that need to be audited.
                </p>
              </div>
              <div className="card-content">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 text-troy-red mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Processing Steps
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 bg-troy-red text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">1</div>
                        <div>
                          <p className="font-medium text-gray-900">Column Removal</p>
                          <p className="text-gray-600 text-sm">Removes columns A, E, and G from the original file</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 bg-troy-red text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">2</div>
                        <div>
                          <p className="font-medium text-gray-900">Row Filtering</p>
                          <p className="text-gray-600 text-sm">Filters out rows where the first column equals "RTS Troy CSC"</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 bg-troy-red text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">3</div>
                        <div>
                          <p className="font-medium text-gray-900">Column Addition</p>
                          <p className="text-gray-600 text-sm">Adds a new "Bin number" column (initially empty)</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 bg-troy-red text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">4</div>
                        <div>
                          <p className="font-medium text-gray-900">Intelligent Sorting</p>
                          <p className="text-gray-600 text-sm">Sorts all data rows alphabetically by the first column</p>
                        </div>
                      </div>
                    </div>
                  </div> */}
                  <div>
                    {/* <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 text-troy-gold mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Supported Formats
                    </h3>
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <div className="w-3 h-3 bg-troy-gold rounded-full mr-3"></div>
                        <span className="font-medium text-gray-900">Excel files (.xlsx, .xls)</span>
                      </div>
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <div className="w-3 h-3 bg-troy-gold rounded-full mr-3"></div>
                        <span className="font-medium text-gray-900">CSV files (.csv)</span>
                      </div>
                    </div> */}
                    {/* <div className="alert alert-info">
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <div>
                          <p className="font-medium">Secure & Private</p>
                          <p className="text-sm mt-1">All processing happens in your browser. No data is uploaded to any server.</p>
                        </div>
                      </div>
                    </div> */}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer mt-20 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Troy CSC Auto</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Professional Excel processing tool designed for Troy CSC operations. 
                Fast, secure, and reliable data transformation.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wide mb-4">Features</h4>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>• Client-side processing</li>
                <li>• Secure & private</li>
                <li>• Multiple file formats</li>
                <li>• Instant results</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wide mb-4">Technology</h4>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>• React 18</li>
                <li>• Vite</li>
                <li>• TailwindCSS</li>
                <li>• SheetJS</li>
              </ul>
            </div>
          </div> */}
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              &copy; 2024 Troy CSC Auto. Built with ❤️ for efficient data processing.
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Secure client-side processing • No data leaves your device
            </p>
            <p className="text-gray-500 text-xs mt-2">
              For any questions or support, please contact us at <a href="mailto:hirak214@gmail.com" className="text-troy-red">Hirak Desai</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
