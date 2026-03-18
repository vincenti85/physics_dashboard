'use client'
import dynamic from 'next/dynamic'
import { useHeatIsland } from '@/hooks/useHeatIsland'
import { PanelCard } from '@/components/ui/PanelCard'
import { useState } from 'react'

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false })

export function UrbanHeatIsland() {
  const { data: cities = [], isLoading, isError } = useHeatIsland()
  const [showSurface, setShowSurface] = useState(false)

  const maxTemp = Math.max(...cities.map(c => c.temperature), 0)
  const status = isError ? 'error' : isLoading ? 'loading' : maxTemp > 100 ? 'warning' : 'nominal'

  return (
    <PanelCard
      title="Urban Heat Island"
      subtitle="Open-Meteo · Alabama Cities"
      status={status}
      badge={maxTemp > 0 ? `${maxTemp.toFixed(0)}°F max` : undefined}
    >
      <div className="flex flex-col gap-2 h-full">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSurface(false)}
            className={`text-xs px-2 py-1 rounded ${!showSurface ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400'}`}
          >2m Air Temp</button>
          <button
            onClick={() => setShowSurface(true)}
            className={`text-xs px-2 py-1 rounded ${showSurface ? 'bg-orange-600 text-white' : 'bg-white/5 text-slate-400'}`}
          >Surface Temp</button>
        </div>
        <div className="h-[218px]">
          {isLoading && <div className="text-slate-500 text-sm text-center py-8">Loading temperature data&hellip;</div>}
          {!isLoading && cities.length > 0 && (
            <Plot
              data={[{
                type: 'bar',
                x: cities.map(c => c.city),
                y: cities.map(c => showSurface ? c.surfaceTemperature : c.temperature),
                marker: {
                  color: cities.map(c => {
                    const t = showSurface ? c.surfaceTemperature : c.temperature
                    if (t > 100) return '#ef4444'
                    if (t > 90) return '#f97316'
                    if (t > 80) return '#f59e0b'
                    return '#3b82f6'
                  }),
                },
                text: cities.map(c => `${(showSurface ? c.surfaceTemperature : c.temperature).toFixed(1)}°F`),
                textposition: 'outside',
                textfont: { color: '#94a3b8', size: 9 },
              }]}
              layout={{
                paper_bgcolor: 'transparent', plot_bgcolor: 'transparent',
                height: 218,
                margin: { t: 18, b: 50, l: 38, r: 8 },
                font: { color: '#94a3b8', size: 10 },
                yaxis: { title: { text: '°F' }, gridcolor: '#1e293b', range: [50, Math.max(115, maxTemp + 12)] },
                xaxis: { tickangle: -35, tickfont: { size: 9 } },
              }}
              config={{ displayModeBar: false, responsive: true }}
              style={{ width: '100%', height: '218px' }}
              useResizeHandler
            />
          )}
        </div>
      </div>
    </PanelCard>
  )
}
