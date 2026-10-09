import { useMemo, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { Responsive, WidthProvider } from 'react-grid-layout/legacy'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import ChartRenderer from '../components/ChartRenderer'
import { toPng, toCanvas } from 'html-to-image'
import { jsPDF } from 'jspdf'
import { supabase } from '../utils/supabase'
import { nanoid } from 'nanoid'
import toast from 'react-hot-toast'

const ResponsiveGridLayout = WidthProvider(Responsive)

const CHART_TYPE_ICONS = {
  Bar: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="12" width="4" height="9"/><rect x="10" y="6" width="4" height="15"/><rect x="17" y="3" width="4" height="18"/>
    </svg>
  ),
  Line: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 17 9 7 6 12 2 12"/>
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
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
}

export default function Load() {
  const chartConfig = useStore(state => state.chartConfig)
  const layoutConfig = useStore(state => state.layoutConfig)
  const rawData = useStore(state => state.rawData)
  const setLayoutConfig = useStore(state => state.setLayoutConfig)
  const navigate = useNavigate()
  const [isSaving, setIsSaving] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [shareUrl, setShareUrl] = useState(null)

  useEffect(() => {
    if (chartConfig.length > 0) {
      const existingIds = layoutConfig.map(l => l.i)
      const newLayout = [...layoutConfig]
      chartConfig.forEach((chart, index) => {
        if (!existingIds.includes(chart.id)) {
          newLayout.push({
            i: chart.id,
            x: (index * 6) % 12,
            y: Infinity,
            w: chart.w || 6,
            h: chart.h || 5
          })
        }
      })
      const chartIds = chartConfig.map(c => c.id)
      const cleanedLayout = newLayout.filter(l => chartIds.includes(l.i))
      if (cleanedLayout.length !== layoutConfig.length) {
        setLayoutConfig(cleanedLayout)
      }
    } else if (layoutConfig.length > 0) {
      setLayoutConfig([])
    }
  }, [chartConfig])

  const onLayoutChange = (layout) => setLayoutConfig(layout)

  const exportAsPNG = async () => {
    setIsExporting(true)
    const el = document.querySelector('.export-container')
    if (!el) return
    try {
      const dataUrl = await toPng(el, { 
        backgroundColor: '#fafafa', 
        pixelRatio: 2,
        width: el.scrollWidth,
        height: el.scrollHeight,
        style: {
          overflow: 'hidden'
        }
      })
      const link = document.createElement('a')
      link.download = 'clarix-dashboard.png'
      link.href = dataUrl
      link.click()
      toast.success('Exported as PNG!')
    } catch (err) {
      console.error("PNG Export Error:", err)
      toast.error('Export failed')
    } finally {
      setIsExporting(false)
    }
  }

  const exportAsPDF = async () => {
    setIsExporting(true)
    const el = document.querySelector('.export-container')
    if (!el) return
    try {
      const canvas = await toCanvas(el, { 
        backgroundColor: '#fafafa', 
        pixelRatio: 2,
        width: el.scrollWidth,
        height: el.scrollHeight,
        style: {
          overflow: 'hidden'
        }
      })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2]
      })
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2)
      pdf.save('clarix-dashboard.pdf')
      toast.success('Exported as PDF!')
    } catch (err) {
      console.error("PDF Export Error:", err)
      toast.error('Export failed')
    } finally {
      setIsExporting(false)
    }
  }

  const saveToSupabase = async () => {
    setIsSaving(true)
    const slug = nanoid(10)
    try {
      const { error } = await supabase.from('dashboards').insert([{
        slug,
        config: { chartConfig, layoutConfig, rawData }
      }])
      if (error) throw error
      const url = `${window.location.origin}/d/${slug}`
      setShareUrl(url)
      await navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard!')
    } catch (err) {
      console.error(err)
      toast.error('Failed to save dashboard')
    } finally {
      setIsSaving(false)
    }
  }

  if (chartConfig.length === 0) {
    return (
      <div className="h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
            <svg className="w-10 h-10 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-3">No Charts Yet</h2>
          <p className="text-zinc-500 dark:text-zinc-400 mb-8 text-sm leading-relaxed">
            Head to the Transform screen to generate your visualizations, then come back here.
          </p>
          <button
            onClick={() => navigate('/transform')}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
          >
            Go to Transform →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-gradient-to-br from-zinc-50 via-zinc-100 to-indigo-50/20 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-indigo-950/20">
      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div className="px-6 py-3 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0 gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-0.5">
            {chartConfig.length} chart{chartConfig.length !== 1 ? 's' : ''} · {rawData.length.toLocaleString()} rows
          </p>
        </div>

        {shareUrl && (
          <div className="flex-1 max-w-xs">
            <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 rounded-lg text-xs">
              <svg className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 015.656 0l4-4a4 4 0 01-5.656-5.656l-1.102 1.101" /></svg>
              <span className="truncate font-mono text-indigo-700 dark:text-indigo-300">{shareUrl}</span>
              <button
                onClick={() => { navigator.clipboard.writeText(shareUrl); toast.success('Copied!') }}
                className="shrink-0 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => navigate('/transform')}
            className="flex items-center gap-1.5 px-3 py-2 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-colors font-medium text-sm"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            Edit
          </button>

          <button
            onClick={exportAsPNG}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 text-white rounded-lg transition-colors font-medium text-sm disabled:opacity-50"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            PNG
          </button>

          <button
            onClick={exportAsPDF}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 text-white rounded-lg transition-colors font-medium text-sm disabled:opacity-50"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            PDF
          </button>

          <button
            onClick={saveToSupabase}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-semibold text-sm disabled:opacity-50 shadow-md shadow-indigo-200 dark:shadow-none"
          >
            {isSaving ? (
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
            )}
            {isSaving ? 'Saving…' : 'Share'}
          </button>
        </div>
      </div>

      {/* ── Grid Canvas ─────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto p-5 export-container relative">
        {/* Global Resize Handle Styles */}
        <style dangerouslySetInnerHTML={{__html: `
          .react-grid-item > .react-resizable-handle {
            opacity: 0;
            transition: opacity 0.2s;
            position: absolute;
            width: 24px;
            height: 24px;
            bottom: 6px;
            right: 6px;
            cursor: se-resize;
            z-index: 10;
          }
          .react-grid-item > .react-resizable-handle::after {
            content: '';
            position: absolute;
            right: 4px;
            bottom: 4px;
            width: 8px;
            height: 8px;
            border-right: 2.5px solid #6366f1;
            border-bottom: 2.5px solid #6366f1;
            border-bottom-right-radius: 2px;
          }
          .react-grid-item:hover > .react-resizable-handle {
            opacity: 1;
          }
        `}} />
        <ResponsiveGridLayout
          className="layout"
          layouts={{ lg: layoutConfig }}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={60}
          onLayoutChange={(layout, allLayouts) => setLayoutConfig(allLayouts.lg || layout)}
          draggableHandle=".drag-handle"
          margin={[16, 16]}
          isResizable={true}
          isDraggable={true}
          resizeHandles={['se']}
        >
          {layoutConfig.map(l => {
            const chart = chartConfig.find(c => c.id === l.i)
            if (!chart) return null
            return (
              <div
                key={l.i}
                data-grid={l}
                className="group bg-white dark:bg-zinc-900 rounded-2xl shadow-sm hover:shadow-md border border-zinc-200/80 dark:border-zinc-800 flex flex-col transition-shadow duration-200 relative"
              >
                {/* Card header */}
                <div className="drag-handle cursor-move px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between shrink-0 select-none rounded-t-2xl">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-zinc-400 dark:text-zinc-500 shrink-0">
                      {CHART_TYPE_ICONS[chart.type] || CHART_TYPE_ICONS.Bar}
                    </span>
                    <span className="font-semibold text-sm text-zinc-800 dark:text-zinc-100 truncate">{chart.title}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
                      {chart.type}
                    </span>
                    {/* Drag dots indicator */}
                    <svg className="w-4 h-4 text-zinc-300 dark:text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 24 24">
                      <circle cx="9" cy="5" r="1.5"/><circle cx="15" cy="5" r="1.5"/>
                      <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
                      <circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="19" r="1.5"/>
                    </svg>
                  </div>
                </div>

                <div className="flex-1 p-3 min-h-0 relative rounded-b-2xl">
                  <div className="absolute inset-3">
                    <ChartRenderer chartConfig={chart} />
                  </div>
                </div>
              </div>
            )
          })}
        </ResponsiveGridLayout>

        {/* Watermark */}
        <div className="mt-8 pb-4 pr-4 flex justify-end opacity-40 pointer-events-none items-center gap-1.5">
          <img src="/logo.png" alt="Logo" className="w-4 h-4 rounded-sm object-cover" />
          <span className="text-xs font-bold tracking-wider text-zinc-500 dark:text-zinc-400">Built with Clarix</span>
        </div>
      </div>
    </div>
  )
}
