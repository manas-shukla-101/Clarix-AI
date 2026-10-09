import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../utils/supabase'
import ChartRenderer from '../components/ChartRenderer'
import { useStore } from '../store/useStore'
import { Responsive, WidthProvider } from 'react-grid-layout/legacy'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

const ResponsiveGridLayout = WidthProvider(Responsive)

const CHART_TYPE_ICONS = {
  Bar: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-4"/>
    </svg>
  ),
  Line: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  Pie: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>
    </svg>
  ),
  Funnel: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
    </svg>
  ),
  Area: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 20H2v-6l5-4 5 4 5-8 5 6z" />
    </svg>
  ),
  Scatter: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="15" r="2"/><circle cx="17" cy="7" r="2"/><circle cx="11" cy="19" r="2"/><circle cx="19" cy="15" r="2"/>
    </svg>
  ),
  Metric: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><path d="M9 9h6v6H9z"/>
    </svg>
  )
}

export default function SharedView() {
  const { slug } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sharedConfig, setSharedConfig] = useState(null)
  const [viewMode, setViewMode] = useState('dashboard') // 'dashboard' | 'charts'
  const [currentIndex, setCurrentIndex] = useState(0)
  const setRawData = useStore(state => state.setRawData)

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('dashboards')
          .select('config')
          .eq('slug', slug)
          .single()
        if (error) throw error
        if (data?.config) {
          setSharedConfig(data.config)
          setRawData(data.config.rawData || [])
        } else {
          setError('Dashboard not found.')
        }
      } catch (err) {
        console.error(err)
        setError('Failed to load dashboard.')
      } finally {
        setLoading(false)
      }
    }
    loadDashboard()
  }, [slug, setRawData])

  // Keyboard navigation for Charts view
  const handleKeyDown = useCallback((e) => {
    if (viewMode !== 'charts' || !sharedConfig?.chartConfig?.length) return
    const total = sharedConfig.chartConfig.length
    if (e.key === 'ArrowRight') {
      setCurrentIndex(p => Math.min(p + 1, total - 1))
    } else if (e.key === 'ArrowLeft') {
      setCurrentIndex(p => Math.max(p - 1, 0))
    }
  }, [viewMode, sharedConfig])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-100 dark:border-indigo-900/50" />
          <div className="absolute inset-0 rounded-full border-4 border-t-indigo-600 animate-spin" />
        </div>
        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">Loading dashboard…</p>
      </div>
    )
  }

  if (error || !sharedConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">404 — Not Found</h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-8">{error || 'This dashboard does not exist or has been removed.'}</p>
          <Link to="/" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors">
            Go to Clarix →
          </Link>
        </div>
      </div>
    )
  }

  const { chartConfig, layoutConfig } = sharedConfig
  if (!chartConfig?.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-zinc-500">This dashboard has no charts.</p>
      </div>
    )
  }

  const total = chartConfig.length
  const currentChart = chartConfig[currentIndex] || chartConfig[0]

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-indigo-50/30 to-zinc-50 dark:from-zinc-950 dark:via-indigo-950/20 dark:to-zinc-950 flex flex-col p-4 md:p-8">
      {/* ── Top Header & View Toggle ────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 group">
            <img src="/logo.png" alt="Clarix Logo" className="w-9 h-9 rounded-xl object-contain bg-zinc-900 shadow-md shadow-zinc-900/20 group-hover:scale-105 transition-transform" />
            <div>
              <span className="font-bold text-lg tracking-tight block leading-tight">Clarix</span>
              <span className="text-[10px] text-zinc-400 font-medium">Shared Analytics</span>
            </div>
          </Link>
        </div>

        {/* View Switcher: Dashboard View vs Charts View */}
        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 bg-zinc-200/80 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold shadow-inner">
            <button
              onClick={() => setViewMode('dashboard')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                viewMode === 'dashboard'
                  ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
              Dashboard View
            </button>
            <button
              onClick={() => setViewMode('charts')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                viewMode === 'charts'
                  ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-4"/>
              </svg>
              Charts View {viewMode === 'charts' && `(${currentIndex + 1}/${total})`}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mode 1: Full Dashboard Grid View ────────────────────────────── */}
      {viewMode === 'dashboard' && (
        <div className="flex-1 max-w-7xl mx-auto w-full">
          <ResponsiveGridLayout
            className="layout"
            layouts={{ lg: layoutConfig || [] }}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={60}
            margin={[16, 16]}
            isDraggable={false}
            isResizable={true}
          >
            {(layoutConfig || []).map(l => {
              const chart = chartConfig.find(c => c.id === l.i)
              if (!chart) return null
              const chartIdx = chartConfig.findIndex(c => c.id === l.i)
              return (
                <div
                  key={l.i}
                  data-grid={l}
                  className="group bg-white dark:bg-zinc-900 rounded-2xl shadow-sm hover:shadow-md border border-zinc-200/80 dark:border-zinc-800 flex flex-col transition-all duration-200 relative"
                >
                  {/* Card header */}
                  <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between shrink-0 select-none rounded-t-2xl">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-zinc-400 dark:text-zinc-500 shrink-0">
                        {CHART_TYPE_ICONS[chart.type] || CHART_TYPE_ICONS.Bar}
                      </span>
                      <h3 className="font-semibold text-sm truncate">{chart.title}</h3>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          if (chartIdx !== -1) setCurrentIndex(chartIdx)
                          setViewMode('charts')
                        }}
                        title="Focus on this chart in Charts View"
                        className="p-1 rounded-md text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                      </button>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded">
                        {chart.type}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 p-3 min-h-0 relative rounded-b-2xl overflow-hidden">
                    <div className="absolute inset-3">
                      <ChartRenderer chartConfig={chart} />
                    </div>
                  </div>
                  
                  {/* Custom Resize Handle styling */}
                  <style dangerouslySetInnerHTML={{__html: `
                    .react-grid-item > .react-resizable-handle {
                      opacity: 0.3;
                      transition: opacity 0.2s, background-color 0.2s;
                      width: 20px;
                      height: 20px;
                      bottom: 4px;
                      right: 4px;
                      border-bottom-right-radius: 12px;
                      cursor: se-resize;
                    }
                    .react-grid-item.group:hover > .react-resizable-handle {
                      opacity: 1;
                      background-color: rgba(99, 102, 241, 0.1);
                    }
                  `}} />
                </div>
              )
            })}
          </ResponsiveGridLayout>
        </div>
      )}

      {/* ── Mode 2: Individual Charts Slideshow View ─────────────────────── */}
      {viewMode === 'charts' && (
        <div className="flex-1 flex flex-col items-center justify-center max-w-5xl mx-auto w-full">
          {/* Main Chart Focus Card */}
          <div className="w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200/80 dark:border-zinc-800 flex flex-col overflow-hidden h-[62vh] md:h-[68vh] transition-all">
            {/* Header */}
            <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between shrink-0">
              <div className="min-w-0 pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-indigo-600 dark:text-indigo-400">
                    {CHART_TYPE_ICONS[currentChart.type] || CHART_TYPE_ICONS.Bar}
                  </span>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 truncate">
                    {currentChart.title}
                  </h2>
                </div>
                {currentChart.xAxis && currentChart.yAxis && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    X: <span className="font-mono text-zinc-700 dark:text-zinc-300">{currentChart.xAxis}</span> · Y: <span className="font-mono text-zinc-700 dark:text-zinc-300">{currentChart.yAxis}</span>
                  </p>
                )}
                {currentChart.type === 'Metric' && currentChart.yAxis && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Metric: <span className="font-mono text-zinc-700 dark:text-zinc-300">{currentChart.yAxis}</span>
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('dashboard')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                  </svg>
                  All in Dashboard
                </button>
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
                  {currentChart.type}
                </span>
              </div>
            </div>

            {/* Chart Area */}
            <div className="flex-1 p-6 min-h-0 relative">
              <div className="absolute inset-6">
                <ChartRenderer chartConfig={currentChart} />
              </div>
            </div>
          </div>

          {/* Controls: Prev, Dot Indicators, Next */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 w-full">
            <button
              onClick={() => setCurrentIndex(p => Math.max(p - 1, 0))}
              disabled={currentIndex === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200 dark:border-zinc-700 font-medium text-sm hover:bg-zinc-50 dark:hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>

            {/* Chart Selector Pills / Dot Indicators */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/70 dark:bg-zinc-900/70 backdrop-blur rounded-full border border-zinc-200 dark:border-zinc-800 shadow-sm">
              {chartConfig.map((c, i) => (
                <button
                  key={c.id || i}
                  onClick={() => setCurrentIndex(i)}
                  title={`${i + 1}. ${c.title} (${c.type})`}
                  className={`rounded-full transition-all duration-200 ${
                    i === currentIndex
                      ? 'w-7 h-2.5 bg-indigo-600 dark:bg-indigo-500'
                      : 'w-2.5 h-2.5 bg-zinc-300 dark:bg-zinc-700 hover:bg-indigo-300'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => setCurrentIndex(p => Math.min(p + 1, total - 1))}
              disabled={currentIndex === total - 1}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 dark:shadow-none font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">
            Tip: Use keyboard arrow keys <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 font-mono text-[10px]">←</kbd> and <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 font-mono text-[10px]">→</kbd> to navigate
          </p>
        </div>
      )}

      {/* ── Footer Watermark ────────────────────────────────────────────── */}
      <div className="mt-8 flex items-center justify-center gap-1.5 opacity-40">
        <img src="/logo.png" alt="Logo" className="w-4 h-4 rounded-sm object-cover" />
        <span className="text-xs font-semibold tracking-wider text-zinc-500">Built with Clarix</span>
      </div>
    </div>
  )
}

