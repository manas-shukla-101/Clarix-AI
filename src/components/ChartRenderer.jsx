import React, { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { useStore } from '../store/useStore'

// Curated color palette
const PALETTE = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
  '#10b981', '#3b82f6', '#ef4444', '#14b8a6',
  '#f97316', '#84cc16'
]

function formatNumber(n) {
  if (n == null || isNaN(n) || !isFinite(n)) return '0'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

export default function ChartRenderer({ chartConfig }) {
  const rawData = useStore(state => state.rawData)

  const isDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
  const textColor = isDark ? '#a1a1aa' : '#71717a'
  const lineColor = isDark ? '#27272a' : '#f4f4f5'
  const labelColor = isDark ? '#d4d4d8' : '#3f3f46'

  // ── ECharts option builder ────────────────────────────────────────────────
  const option = useMemo(() => {
    if (chartConfig.type === 'Metric') return {}

    const { type, xAxis, yAxis } = chartConfig

    const base = {
      backgroundColor: 'transparent',
      animation: true,
      animationDuration: 800,
      animationEasing: 'cubicOut',
      tooltip: {
        trigger: 'axis',
        backgroundColor: isDark ? '#18181b' : '#fff',
        borderColor: isDark ? '#3f3f46' : '#e4e4e7',
        borderWidth: 1,
        textStyle: { color: isDark ? '#f4f4f5' : '#18181b', fontSize: 12 },
        extraCssText: 'border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.15);padding:10px 14px;'
      },
      grid: { left: '2%', right: '3%', top: '16%', bottom: '8%', containLabel: true }
    }

    if (!xAxis || !yAxis) return base

    // ── Bar ──────────────────────────────────────────────────────────────
    if (type === 'Bar') {
      const grouped = {}
      rawData.forEach(row => {
        const key = String(row[xAxis] ?? 'Unknown')
        const val = Number(row[yAxis] ?? 0)
        grouped[key] = (grouped[key] || 0) + (isNaN(val) ? 0 : val)
      })
      const entries = Object.entries(grouped)
      if (entries.length > 25) {
        entries.sort((a, b) => b[1] - a[1])
        entries.splice(25)
      }
      const aggX = entries.map(e => e[0])
      const aggY = entries.map(e => e[1])

      return {
        ...base,
        xAxis: {
          type: 'category', data: aggX,
          axisLine: { lineStyle: { color: lineColor } },
          axisLabel: { color: textColor, fontSize: 11, rotate: aggX.length > 6 ? 30 : 0 },
          axisTick: { show: false }
        },
        yAxis: {
          type: 'value',
          splitLine: { lineStyle: { color: lineColor, type: 'dashed' } },
          axisLabel: { color: textColor, fontSize: 11, formatter: v => formatNumber(v) }
        },
        series: [{
          data: aggY, type: 'bar',
          itemStyle: {
            borderRadius: [6, 6, 0, 0],
            color: {
              type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: '#818cf8' },
                { offset: 1, color: '#6366f1' }
              ]
            }
          },
          emphasis: { itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#a5b4fc' }, { offset: 1, color: '#818cf8' }] } } },
          label: {
            show: aggY.length <= 15,
            position: 'top',
            formatter: p => formatNumber(p.value),
            color: labelColor,
            fontSize: 10,
            fontWeight: 600
          }
        }]
      }
    }

    // ── Line & Area ─────────────────────────────────────────────────────────────
    if (type === 'Line' || type === 'Area') {
      const isArea = type === 'Area'
      const dateMap = {}
      rawData.forEach(row => {
        const key = String(row[xAxis] ?? 'Unknown')
        const val = Number(row[yAxis] ?? 0)
        dateMap[key] = (dateMap[key] || 0) + (isNaN(val) ? 0 : val)
      })
      const dateEntries = Object.entries(dateMap)
      dateEntries.sort((a, b) => {
        const da = Date.parse(a[0])
        const db = Date.parse(b[0])
        if (!isNaN(da) && !isNaN(db)) return da - db
        return a[0].localeCompare(b[0])
      })
      const aggX = dateEntries.map(e => e[0])
      const aggY = dateEntries.map(e => e[1])

      return {
        ...base,
        xAxis: {
          type: 'category', data: aggX,
          axisLine: { lineStyle: { color: lineColor } },
          axisLabel: { color: textColor, fontSize: 11, rotate: aggX.length > 8 ? 30 : 0 },
          axisTick: { show: false },
          boundaryGap: false
        },
        yAxis: {
          type: 'value',
          splitLine: { lineStyle: { color: lineColor, type: 'dashed' } },
          axisLabel: { color: textColor, fontSize: 11, formatter: v => formatNumber(v) }
        },
        series: [{
          data: aggY, type: 'line', smooth: true,
          symbol: 'circle', symbolSize: aggY.length > 30 ? 2 : 6,
          lineStyle: { width: 3, color: '#818cf8' },
          itemStyle: { color: '#6366f1', borderColor: '#fff', borderWidth: 2 },
          areaStyle: isArea ? {
            color: {
              type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(99,102,241,0.6)' },
                { offset: 1, color: 'rgba(99,102,241,0.05)' }
              ]
            }
          } : undefined,
          label: {
            show: aggY.length <= 12,
            position: 'top',
            formatter: p => formatNumber(p.value),
            color: labelColor,
            fontSize: 10,
            fontWeight: 600
          }
        }]
      }
    }

    // ── Scatter ───────────────────────────────────────────────────────────
    if (type === 'Scatter') {
      const scatterData = rawData.map(d => [Number(d[xAxis] ?? 0), Number(d[yAxis] ?? 0)])
      return {
        ...base,
        tooltip: {
          ...base.tooltip,
          trigger: 'item',
          formatter: p => {
            const val = Array.isArray(p) ? p[0].value : (p.value || p.data || [])
            return `${xAxis}: ${formatNumber(val[0] || 0)}<br/>${yAxis}: ${formatNumber(val[1] || 0)}`
          }
        },
        xAxis: {
          type: 'value', name: xAxis, nameLocation: 'middle', nameGap: 28,
          nameTextStyle: { color: textColor, fontSize: 11 },
          splitLine: { lineStyle: { color: lineColor, type: 'dashed' } },
          axisLabel: { color: textColor, fontSize: 11 }
        },
        yAxis: {
          type: 'value', name: yAxis, nameLocation: 'middle', nameGap: 40,
          nameTextStyle: { color: textColor, fontSize: 11 },
          splitLine: { lineStyle: { color: lineColor, type: 'dashed' } },
          axisLabel: { color: textColor, fontSize: 11 }
        },
        series: [{
          data: scatterData, type: 'scatter', symbolSize: 10,
          itemStyle: {
            color: {
              type: 'radial', x: 0.5, y: 0.5, r: 0.5,
              colorStops: [
                { offset: 0, color: '#a5b4fc' },
                { offset: 1, color: '#6366f1' }
              ]
            },
            opacity: 0.85
          },
          emphasis: { itemStyle: { opacity: 1, symbolSize: 14 } }
        }]
      }
    }

    // ── Pie & Funnel ───────────────────────────────────────────────────────
    if (type === 'Pie' || type === 'Funnel') {
      const grouped = {}
      rawData.forEach(row => {
        const key = String(row[xAxis] ?? 'Unknown')
        const val = Number(row[yAxis] ?? 0)
        grouped[key] = (grouped[key] || 0) + val
      })
      const dataItems = Object.entries(grouped)
        .map(([name, value], i) => ({
          name, value,
          itemStyle: { color: PALETTE[i % PALETTE.length] }
        }))
        
      if (type === 'Funnel') {
        dataItems.sort((a, b) => b.value - a.value)
      }

      return {
        ...base,
        tooltip: {
          trigger: 'item',
          formatter: p => `${p.name}<br/><b>${formatNumber(p.value)}</b> (${p.percent}%)`,
          ...base.tooltip
        },
        legend: {
          orient: 'horizontal', bottom: 4,
          textStyle: { color: textColor, fontSize: 11 },
          icon: 'circle',
          itemWidth: 8, itemHeight: 8
        },
        series: [{
          type: type.toLowerCase(),
          radius: type === 'Pie' ? ['38%', '68%'] : undefined,
          center: type === 'Pie' ? ['50%', '45%'] : undefined,
          left: type === 'Funnel' ? '10%' : undefined,
          width: type === 'Funnel' ? '80%' : undefined,
          avoidLabelOverlap: true,
          padAngle: type === 'Pie' ? 3 : 0,
          itemStyle: { borderRadius: type === 'Pie' ? 8 : 4, borderColor: isDark ? '#18181b' : '#fff', borderWidth: type === 'Pie' ? 3 : 2 },
          label: {
            show: true,
            formatter: p => `${p.percent}%`,
            color: labelColor,
            fontSize: 11,
            fontWeight: 700
          },
          labelLine: { show: true, length: 8, length2: 12, lineStyle: { color: textColor } },
          emphasis: {
            scale: true, scaleSize: 6,
            label: { fontSize: 13, fontWeight: 700 }
          },
          data: dataItems
        }]
      }
    }

    return base
  }, [chartConfig, rawData, isDark, textColor, lineColor, labelColor])

  // ── Metric / KPI card ────────────────────────────────────────────────────
  if (chartConfig.type === 'Metric') {
    let total = 0
    let min = Infinity, max = -Infinity, count = 0
    rawData.forEach(row => {
      const val = Number(row[chartConfig.yAxis])
      if (!isNaN(val)) {
        total += val
        if (val < min) min = val
        if (val > max) max = val
        count++
      }
    })
    if (!chartConfig.yAxis) { total = rawData.length; count = rawData.length }

    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center select-none">
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: textColor }}>
          {chartConfig.title}
        </p>
        <p className="text-5xl font-black bg-gradient-to-br from-indigo-500 to-purple-600 bg-clip-text text-transparent leading-tight">
          {formatNumber(total)}
        </p>
        {chartConfig.yAxis && (
          <div className="flex gap-4 mt-4 text-xs" style={{ color: textColor }}>
            <span>↑ Max {formatNumber(max === Infinity ? 0 : max)}</span>
            <span>↓ Min {formatNumber(min === Infinity ? 0 : min)}</span>
            <span>n = {count}</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <ReactECharts
      option={option}
      style={{ height: '100%', width: '100%' }}
      notMerge={true}
      lazyUpdate={false}
      opts={{ renderer: 'canvas' }}
    />
  )
}
