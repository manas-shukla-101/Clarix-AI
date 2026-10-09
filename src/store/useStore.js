import { create } from 'zustand'

export const useStore = create((set) => ({
  rawData: [],
  columnTypes: {},
  chartConfig: [],
  layoutConfig: [],

  setRawData: (data) => set({ rawData: data }),
  setColumnTypes: (types) => set({ columnTypes: types }),
  setChartConfig: (config) => set({ chartConfig: config }),
  updateChartById: (id, updates) => set((state) => ({
    chartConfig: state.chartConfig.map(chart => 
      chart.id === id ? { ...chart, ...updates } : chart
    )
  })),
  setLayoutConfig: (layout) => set({ layoutConfig: layout }),
}))
