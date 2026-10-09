import { useState, useMemo, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { getChartRecommendations, getChartRecommendationsAsync } from '../utils/chartRecommendations'
import { detectColumnTypes } from '../utils/typeDetection'
import { nanoid } from 'nanoid'

export default function Transform() {
  const rawData = useStore(state => state.rawData)
  const columnTypes = useStore(state => state.columnTypes)
  const setColumnTypes = useStore(state => state.setColumnTypes)
  const chartConfig = useStore(state => state.chartConfig)
  const setChartConfig = useStore(state => state.setChartConfig)
  const navigate = useNavigate()

  // Ensure columnTypes reflects robust type detection
  useEffect(() => {
    if (rawData && rawData.length > 0) {
      const refreshedTypes = detectColumnTypes(rawData)
      let needsUpdate = false
      for (const k in refreshedTypes) {
        if (columnTypes[k] !== refreshedTypes[k]) {
          needsUpdate = true
          break
        }
      }
      if (needsUpdate) {
        setColumnTypes(refreshedTypes)
      }
    }
  }, [rawData, columnTypes, setColumnTypes])

  const [customChart, setCustomChart] = useState({
    title: 'Custom Chart',
    type: 'Bar',
    xAxis: '',
    yAxis: '',
    colorBy: '',
    baseColor: '#6366f1'
  })

  const [recommendations, setRecommendations] = useState([])
  const [isLoadingRecs, setIsLoadingRecs] = useState(true)

  useEffect(() => {
    let isMounted = true
    setIsLoadingRecs(true)
    
    getChartRecommendationsAsync(columnTypes, rawData).then(recs => {
      if (isMounted) {
        setRecommendations(recs)
        setIsLoadingRecs(false)
      }
    })

    return () => { isMounted = false }
  }, [columnTypes, rawData])

  const columns = Object.keys(columnTypes)

  const addChart = (rec) => {
    const newChart = {
      id: nanoid(),
      type: rec.type,
      title: rec.title,
      xAxis: rec.xAxis || null,
      yAxis: rec.yAxis || null,
      colorBy: rec.colorBy || null,
      baseColor: rec.baseColor || '#6366f1',
      w: 6, // default width
      h: 4, // default height
    }
    setChartConfig([...chartConfig, newChart])
  }

  const addCustomChart = () => {
    if (!customChart.xAxis && customChart.type !== 'Metric') return
    if (!customChart.yAxis) return
    addChart({ ...customChart })
    setCustomChart({
      title: 'Custom Chart',
      type: 'Bar',
      xAxis: '',
      yAxis: '',
      colorBy: '',
      baseColor: '#6366f1'
    })
  }

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
    <div className="min-h-[calc(100vh-64px)] flex flex-col bg-gradient-to-br from-zinc-50 via-zinc-100 to-indigo-50/20 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-indigo-950/20">
      <div className="max-w-7xl mx-auto w-full py-8 px-4 flex-1 flex flex-col relative z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-zinc-200/50 dark:border-zinc-800/50">
          <div className="flex items-center gap-4">
            <Link to="/">
              <img src="/logo.png" alt="Clarix Logo" className="w-12 h-12 rounded-xl bg-zinc-900 shadow-md hover:scale-105 transition-transform" />
            </Link>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Build Dashboard</h1>
              <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                Select recommended charts to add them to your dashboard canvas.
              </p>
            </div>
          </div>
          <button 
          onClick={() => navigate('/load')}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-sm transition-colors"
        >
          Next: Layout & Share
        </button>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Recommended for your data</h2>
        {isLoadingRecs ? (
          <div className="flex items-center justify-center p-12 border border-zinc-200 dark:border-zinc-800 rounded-xl">
            <div className="flex flex-col items-center">
              <svg className="animate-spin h-8 w-8 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-zinc-500 font-medium text-sm">Generating intelligent recommendations...</p>
            </div>
          </div>
        ) : recommendations.length === 0 ? (
          <p className="text-zinc-500">Not enough variation in data types to recommend charts.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendations.map((rec, i) => (
              <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">
                      {rec.type}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg mb-1">{rec.title}</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 line-clamp-2">
                    {rec.description}
                  </p>
                  <div className="text-xs text-zinc-400 dark:text-zinc-500 font-mono mb-4">
                    {rec.xAxis && <div>X: {rec.xAxis}</div>}
                    {rec.yAxis && <div>Y: {rec.yAxis}</div>}
                  </div>
                </div>
                <button 
                  onClick={() => addChart(rec)}
                  className="w-full py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-medium rounded-lg transition-colors"
                >
                  + Add to Dashboard
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Configuration & Added Charts Panel ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Custom Chart Builder */}
        <div className="lg:col-span-2 p-6 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-xl border border-white/20 dark:border-zinc-800/80 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none transition-opacity group-hover:opacity-100 opacity-50"></div>
          
          <div className="relative z-10">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
              Build Custom Chart
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Chart Type</label>
                <select 
                  value={customChart.type}
                  onChange={e => setCustomChart({...customChart, type: e.target.value})}
                  className="w-full px-4 py-2.5 bg-zinc-50/50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm font-medium"
                >
                  <option value="Bar">Bar Chart</option>
                  <option value="Line">Line Chart</option>
                  <option value="Area">Area Chart</option>
                  <option value="Pie">Pie Chart</option>
                  <option value="Funnel">Funnel Chart</option>
                  <option value="Scatter">Scatter Plot</option>
                  <option value="Metric">Number Metric</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Chart Title</label>
                <input 
                  type="text"
                  placeholder="E.g. Monthly Revenue"
                  value={customChart.title}
                  onChange={e => setCustomChart({...customChart, title: e.target.value})}
                  className="w-full px-4 py-2.5 bg-zinc-50/50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm font-medium placeholder-zinc-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">X-Axis (Dimension)</label>
                <select 
                  value={customChart.xAxis}
                  onChange={e => setCustomChart({...customChart, xAxis: e.target.value})}
                  disabled={customChart.type === 'Metric'}
                  className="w-full px-4 py-2.5 bg-zinc-50/50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm font-medium disabled:opacity-40"
                >
                  <option value="">Select column...</option>
                  {columns.map(c => (
                    <option key={c} value={c} disabled={(customChart.type === 'Scatter' && columnTypes[c] !== 'number') || (customChart.type === 'Line' && columnTypes[c] !== 'date' && columnTypes[c] !== 'number')}>
                      {c} ({columnTypes[c]})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Y-Axis (Measure)</label>
                <select 
                  value={customChart.yAxis}
                  onChange={e => setCustomChart({...customChart, yAxis: e.target.value})}
                  className="w-full px-4 py-2.5 bg-zinc-50/50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm font-medium"
                >
                  <option value="">Select column...</option>
                  {columns.map(c => (
                    <option key={c} value={c} disabled={columnTypes[c] !== 'number'}>
                      {c} ({columnTypes[c]})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Color By (Optional Stack)</label>
                <select 
                  value={customChart.colorBy}
                  onChange={e => setCustomChart({...customChart, colorBy: e.target.value})}
                  disabled={customChart.type !== 'Bar' && customChart.type !== 'Line' && customChart.type !== 'Area'}
                  className="w-full px-4 py-2.5 bg-zinc-50/50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm font-medium disabled:opacity-40"
                >
                  <option value="">None (Single Color)</option>
                  {columns.map(c => (
                    <option key={c} value={c}>
                      {c} ({columnTypes[c]})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Base Color</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="color"
                    value={customChart.baseColor}
                    onChange={e => setCustomChart({...customChart, baseColor: e.target.value})}
                    className="w-10 h-10 rounded cursor-pointer border-0 p-0 bg-transparent"
                  />
                  <span className="text-sm font-mono text-zinc-500 uppercase">{customChart.baseColor}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button 
                onClick={addCustomChart}
                disabled={(!customChart.xAxis && customChart.type !== 'Metric') || !customChart.yAxis}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:shadow-none transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Add Chart to Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Added Charts List */}
        <div className="lg:col-span-1 p-6 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-xl border border-white/20 dark:border-zinc-800/80 rounded-3xl flex flex-col max-h-[400px]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Your Dashboard</h2>
            <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 font-bold text-xs rounded-full">
              {chartConfig.length} Charts
            </span>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {chartConfig.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                </div>
                <p className="text-sm font-medium text-zinc-500">No charts added yet.</p>
                <p className="text-xs text-zinc-400 mt-1">Add from recommendations or build a custom one.</p>
              </div>
            ) : (
              chartConfig.map(chart => (
                <div key={chart.id} className="group relative bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 p-4 rounded-2xl flex items-center justify-between hover:shadow-md transition-all">
                  <div className="min-w-0 pr-4">
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">{chart.title}</h4>
                    <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold mt-0.5">{chart.type}</p>
                  </div>
                  <button 
                    onClick={() => setChartConfig(chartConfig.filter(c => c.id !== chart.id))}
                    className="shrink-0 w-8 h-8 flex items-center justify-center bg-zinc-200/50 dark:bg-zinc-800/50 text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}
