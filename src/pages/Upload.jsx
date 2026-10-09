import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { useNavigate, Link } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { getDb } from '../utils/duckdb'
import * as XLSX from 'xlsx'
import * as duckdb from '@duckdb/duckdb-wasm'
import { useGoogleLogin } from '@react-oauth/google'
import { detectColumnTypes } from '../utils/typeDetection'

export default function Upload() {
  const [error, setError] = useState(null)
  const [isParsing, setIsParsing] = useState(false)
  const [sheetUrl, setSheetUrl] = useState('')
  const [showSheetInput, setShowSheetInput] = useState(false)
  const [driveFiles, setDriveFiles] = useState([])
  const [accessToken, setAccessToken] = useState(null)
  
  const navigate = useNavigate()
  const setRawData = useStore(state => state.setRawData)
  const setColumnTypes = useStore(state => state.setColumnTypes)
  
  const hasGoogleClientId = !!import.meta.env.VITE_GOOGLE_CLIENT_ID

  const parseFile = async (file) => {
    setIsParsing(true)
    setError(null)
    try {
      const db = await getDb()
      let tableName = `t_${Date.now()}`
      let results = []

      if (file.name.endsWith('.xlsx')) {
        const buffer = await file.arrayBuffer()
        const workbook = XLSX.read(buffer, { type: 'array' })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)
        
        if (jsonData.length === 0) throw new Error("Excel file is empty")
        results = jsonData
      } else {
        const conn = await db.connect()
        try {
          await db.registerFileHandle(file.name, file, duckdb.DuckDBDataProtocol.BROWSER_FILEREADER, true)
          const ext = file.name.split('.').pop().toLowerCase()
          if (ext === 'csv') {
            await conn.query(`CREATE TABLE ${tableName} AS SELECT * FROM read_csv_auto('${file.name}')`)
          } else if (ext === 'json') {
            await conn.query(`CREATE TABLE ${tableName} AS SELECT * FROM read_json_auto('${file.name}')`)
          } else {
            throw new Error('Unsupported file extension for duckdb parse')
          }
          const resultTable = await conn.query(`SELECT * FROM ${tableName}`)
          results = resultTable.toArray().map(row => {
            const obj = row.toJSON()
            for (const key in obj) {
              if (typeof obj[key] === 'bigint') {
                obj[key] = Number(obj[key])
              }
            }
            return obj
          })
        } finally {
          await conn.close()
        }
      }

      setRawData(results)
      setColumnTypes(detectColumnTypes(results))
      navigate('/inspect')
    } catch (err) {
      console.error(err)
      setError(`Failed to parse file: ${err.message}`)
    } finally {
      setIsParsing(false)
    }
  }

  const importFromSheets = async () => {
    if (!sheetUrl.trim()) return
    setIsParsing(true)
    setError(null)
    try {
      const match = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)
      if (!match) throw new Error("Invalid Google Sheets URL")
      const sheetId = match[1]
      
      const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`
      const res = await fetch(exportUrl)
      if (!res.ok) throw new Error("Could not fetch sheet. Ensure it is public.")
      
      const csvText = await res.text()
      if (csvText.includes('<html')) throw new Error("Received HTML. Ensure the sheet is public.")
      
      const file = new File([csvText], 'sheet.csv', { type: 'text/csv' })
      await parseFile(file)
    } catch (err) {
      console.error(err)
      setError(`Failed to import from Google Sheets: ${err.message}`)
      setIsParsing(false)
    }
  }

  const onDrop = useCallback((acceptedFiles, fileRejections) => {
    setError(null)
    if (fileRejections.length > 0) {
      const rejection = fileRejections[0]
      if (rejection.errors[0].code === 'file-too-large') {
        setError('File is too large. Maximum size is 50MB.')
      } else if (rejection.errors[0].code === 'file-invalid-type') {
        setError('Unsupported file format. Please upload CSV, JSON, or Excel (.xlsx).')
      } else {
        setError(rejection.errors[0].message)
      }
      return
    }
    if (acceptedFiles.length > 0) {
      parseFile(acceptedFiles[0])
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 50 * 1024 * 1024,
    accept: {
      'text/csv': ['.csv'],
      'application/json': ['.json'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1
  })

  const loginGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setAccessToken(tokenResponse.access_token)
      try {
        const res = await fetch("https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.spreadsheet'", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        })
        const data = await res.json()
        if (data.files) {
          setDriveFiles(data.files)
        }
      } catch (err) {
        setError("Failed to fetch Google Drive files.")
      }
    },
    scope: 'https://www.googleapis.com/auth/drive.readonly',
    onError: () => setError('Google Login Failed')
  })

  const importDriveFile = async (fileId) => {
    if (!accessToken) return
    setIsParsing(true)
    setError(null)
    try {
      const exportUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/csv`
      const res = await fetch(exportUrl, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      if (!res.ok) throw new Error("Could not fetch sheet from Drive.")
      const csvText = await res.text()
      const file = new File([csvText], 'drive_sheet.csv', { type: 'text/csv' })
      await parseFile(file)
    } catch (err) {
      console.error(err)
      setError(`Failed to import from Drive: ${err.message}`)
      setIsParsing(false)
    }
  }

  const loadSampleData = async () => {
    setIsParsing(true)
    setError(null)
    try {
      const res = await fetch('/sample-data.csv')
      if (!res.ok) throw new Error("Could not load sample data.")
      const csvText = await res.text()
      const file = new File([csvText], 'sample-data.csv', { type: 'text/csv' })
      await parseFile(file)
    } catch (err) {
      console.error(err)
      setError(`Failed to load sample data: ${err.message}`)
      setIsParsing(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] w-full bg-gradient-to-br from-zinc-50 via-zinc-100 to-indigo-50/20 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-indigo-950/20 relative">
      
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-[100px] opacity-20 dark:opacity-10 animate-blob"></div>
        <div className="absolute top-1/2 -left-24 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-[100px] opacity-20 dark:opacity-10 animate-blob animation-delay-2000"></div>
      </div>

      <div className="max-w-4xl mx-auto py-16 px-4 relative z-10">
        <div className="text-center mb-12">
          <Link to="/" className="inline-block hover:scale-105 transition-transform">
            <img src="/logo.png" alt="Clarix Logo" className="w-12 h-12 mx-auto mb-6 rounded-xl bg-zinc-900 shadow-md" />
          </Link>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">Upload Data</h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Drop your file below to start analyzing. Your data is processed entirely in your browser.
          </p>
        </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg">
          {error}
        </div>
      )}

      {isParsing && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-center font-medium">
          Parsing data... please wait.
        </div>
      )}

      <div 
        {...getRootProps()} 
        className={`relative border-2 border-dashed rounded-3xl p-16 text-center cursor-pointer transition-all duration-300 mb-12 overflow-hidden shadow-sm ${
          isDragActive 
            ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-900/20 shadow-md scale-[1.02]' 
            : 'border-zinc-300 dark:border-zinc-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-white/50 dark:hover:bg-zinc-800/30 backdrop-blur-sm'
        } ${isParsing ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input {...getInputProps()} />
        <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-colors duration-300 ${
          isDragActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
        }`}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" x2="12" y1="3" y2="15"/>
          </svg>
        </div>
        <p className="text-xl font-medium mb-2">
          {isDragActive ? "Drop the file here..." : "Drag & drop your file here"}
        </p>
        <p className="text-zinc-500 dark:text-zinc-400 mb-6">
          or click to browse from your computer
        </p>
        <div className="flex items-center justify-center gap-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">
          <span className="flex items-center gap-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            CSV, JSON, XLSX
          </span>
          <span className="w-1 h-1 bg-zinc-300 dark:bg-zinc-600 rounded-full"></span>
          <span>Max 50MB</span>
        </div>
      </div>
      
      <div className="text-center mb-12">
        <p className="text-zinc-600 dark:text-zinc-400 mb-2">Don't have a file ready?</p>
        <button 
          onClick={loadSampleData}
          disabled={isParsing}
          className="px-6 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors rounded-full font-medium text-sm disabled:opacity-50"
        >
          Try with sample data
        </button>
      </div>

      <div className="border-t border-zinc-200 dark:border-zinc-800 pt-8">
        <h2 className="text-xl font-bold mb-4">Import from Google Sheets</h2>
        
        <div className="flex gap-4 flex-wrap mb-4">
          <button 
            onClick={() => setShowSheetInput(!showSheetInput)}
            className="px-6 py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors rounded-xl font-medium flex items-center gap-2"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            Paste Link
          </button>
          
          <button 
            onClick={() => {
              if (hasGoogleClientId) {
                loginGoogle()
              } else {
                setError("Google Client ID is missing. Please set VITE_GOOGLE_CLIENT_ID in your .env.local file. Check the setup guide for instructions.")
              }
            }}
            className="px-6 py-3 bg-blue-100 dark:bg-blue-900/50 hover:bg-blue-200 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 transition-colors rounded-xl font-medium flex items-center gap-2"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
            Sign in with Google
          </button>
        </div>

        {showSheetInput && (
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <input
              type="text"
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/..."
              className="flex-1 px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
            <button
              onClick={importFromSheets}
              disabled={isParsing || !sheetUrl.trim()}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
            >
              Import
            </button>
          </div>
        )}

        {driveFiles.length > 0 && (
          <div className="mt-6 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
            <div className="bg-zinc-50 dark:bg-zinc-800/50 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 font-medium">
              Select a Sheet from Google Drive
            </div>
            <ul className="max-h-60 overflow-y-auto">
              {driveFiles.map(f => (
                <li key={f.id} className="border-b border-zinc-100 dark:border-zinc-800/50 last:border-0">
                  <button 
                    onClick={() => importDriveFile(f.id)}
                    className="w-full text-left px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-sm"
                  >
                    {f.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
    </div>
  )
}
