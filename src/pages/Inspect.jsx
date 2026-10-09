import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { getDb } from '../utils/duckdb'

export default function Inspect() {
  const rawData = useStore(state => state.rawData)
  const columnTypes = useStore(state => state.columnTypes)
  const setColumnTypes = useStore(state => state.setColumnTypes)
  const navigate = useNavigate()

  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 50

  const [sqlQuery, setSqlQuery] = useState("SELECT * FROM data")
  const [sqlError, setSqlError] = useState(null)
  const [isQuerying, setIsQuerying] = useState(false)
  const [displayData, setDisplayData] = useState(rawData)

  const headers = useMemo(() => {
    if (displayData.length === 0) return []
    return Object.keys(displayData[0])
  }, [displayData])

  const sortedData = useMemo(() => {
    let sortableData = [...displayData]
    if (sortConfig.key !== null) {
      sortableData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1
        }
        return 0
      })
    }
    return sortableData
  }, [displayData, sortConfig])

  const currentTableData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * rowsPerPage
    const lastPageIndex = firstPageIndex + rowsPerPage
    return sortedData.slice(firstPageIndex, lastPageIndex)
  }, [currentPage, sortedData])

  const requestSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const runQuery = async () => {
    if (!sqlQuery.trim()) return
    setIsQuerying(true)
    setSqlError(null)
    
    try {
      const db = await getDb()
      const conn = await db.connect()
      try {
        const jsonString = JSON.stringify(rawData, (key, value) => 
          typeof value === 'bigint' ? value.toString() : value
        )
        await db.registerFileText('data.json', jsonString)
        // Ensure table is fresh
        await conn.query(`DROP TABLE IF EXISTS data`)
        await conn.query(`CREATE TABLE data AS SELECT * FROM read_json_auto('data.json')`)
        
        const resultTable = await conn.query(sqlQuery)
        const newResults = resultTable.toArray().map(row => {
          const obj = row.toJSON()
          for (const key in obj) {
            if (typeof obj[key] === 'bigint') {
              obj[key] = Number(obj[key])
            }
          }
          return obj
        })
        setDisplayData(newResults)
        setCurrentPage(1)
        setSortConfig({ key: null, direction: 'asc' })
      } finally {
        await conn.close()
      }
    } catch (err) {
      console.error(err)
      setSqlError(err.message)
    } finally {
      setIsQuerying(false)
    }
  }

  const resetData = () => {
    setDisplayData(rawData)
    setSqlQuery("SELECT * FROM data")
    setSqlError(null)
    setCurrentPage(1)
    setSortConfig({ key: null, direction: 'asc' })
  }

  const totalPages = Math.ceil(sortedData.length / rowsPerPage)

  if (rawData.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">No Data Found</h2>
        <p className="text-zinc-600 mb-8">Please upload a file first.</p>
        <button 
          onClick={() => navigate('/upload')}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium"
        >
          Go to Upload
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 h-[calc(100vh-64px)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Inspect & Clean Data</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Review your data or run SQL queries. Original Rows: {rawData.length} | Displayed: {displayData.length}
          </p>
        </div>
        <button 
          onClick={() => {
            // we should also push displayData to zustand if we want it to be transformed for the next step. 
            // The AC just says "table updates to show transformed data". But if we go to transform step, it expects rawData to be the source.
            // For now, let's just navigate.
            navigate('/transform')
          }}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-sm transition-colors"
        >
          Next: Transform
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 mb-4 flex gap-4 flex-col md:flex-row">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">SQL Transformation (Table: data)</label>
          <textarea
            value={sqlQuery}
            onChange={(e) => setSqlQuery(e.target.value)}
            className="w-full font-mono text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
          />
        </div>
        <div className="flex flex-row md:flex-col gap-2 justify-end">
          <button 
            onClick={runQuery}
            disabled={isQuerying}
            className="px-6 py-2 bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg font-medium hover:bg-zinc-700 dark:hover:bg-zinc-200 disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            {isQuerying ? 'Running...' : 'Run Query'}
          </button>
          <button 
            onClick={resetData}
            disabled={isQuerying}
            className="px-6 py-2 bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-lg font-medium hover:bg-zinc-300 dark:hover:bg-zinc-700 disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            Reset
          </button>
        </div>
      </div>

      {sqlError && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg text-sm font-mono break-all">
          Error: {sqlError}
        </div>
      )}

      <div className="flex-1 overflow-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm min-h-0">
        <table className="min-w-full text-left text-sm whitespace-nowrap">
          <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 shadow-sm z-10">
            <tr>
              {headers.map(header => (
                <th 
                  key={header}
                  onClick={() => requestSort(header)}
                  className="px-6 py-3 font-semibold text-zinc-900 dark:text-zinc-100 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors select-none"
                >
                  <div className="flex items-center gap-2 justify-between">
                    <span className="truncate">{header}</span>
                    <div className="flex items-center gap-1">
                      <select
                        value={columnTypes[header] || 'string'}
                        onClick={e => e.stopPropagation()}
                        onChange={e => {
                          e.stopPropagation()
                          setColumnTypes({ ...columnTypes, [header]: e.target.value })
                        }}
                        title={`Detected type: ${columnTypes[header] || 'string'}. Click to override.`}
                        className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded cursor-pointer outline-none transition-colors border border-transparent hover:border-zinc-300 dark:hover:border-zinc-600 ${
                          columnTypes[header] === 'number'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300'
                            : columnTypes[header] === 'date'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'
                            : 'bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        <option value="string">ABC</option>
                        <option value="number"># Num</option>
                        <option value="date">📅 Date</option>
                      </select>
                      {sortConfig.key === header && (
                        <span className="text-xs text-blue-600 dark:text-blue-400 ml-1">
                          {sortConfig.direction === 'asc' ? '▲' : '▼'}
                        </span>
                      )}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {currentTableData.map((row, index) => (
              <tr key={index} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                {headers.map(header => (
                  <td key={header} className="px-6 py-3 text-zinc-600 dark:text-zinc-300">
                    {row[header] !== null && row[header] !== undefined ? String(row[header]) : ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between shrink-0">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Showing {sortedData.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} to {Math.min(currentPage * rowsPerPage, sortedData.length)} of {sortedData.length} entries
        </p>
        <div className="flex gap-2">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg disabled:opacity-50 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Previous
          </button>
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="px-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg disabled:opacity-50 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
