'use client'
import dynamic from 'next/dynamic'
import { useLiquefaction } from '@/hooks/useLiquefaction'
import { PanelCard } from '@/components/ui/PanelCard'

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false })

const SUSC_COLOR: Record<string, string> = {
  'high': '#ef4444', 'moderate': '#f59e0b', 'low': '#22c55e', 'very low': '#3b82f6', 'unknown': '#64748b'
}

export function SoilLiquefaction() {
  const { eqQuery, soilQuery } = useLiquefaction()
  const earthquakes = eqQuery.data || []
  const soils = soilQuery.data || []

  const recent = earthquakes.filter(e => Date.now() - e.time < 7 * 24 * 3600 * 1000)
  const status = eqQuery.isError ? 'error' : eqQuery.isLoading ? 'loading' : recent.length > 0 ? 'warning' : 'nominal'

  return (
    <PanelCard title="Soil Liquefaction Risk" subtitle="USGS Seismicity · ISRIC SoilGrids" status={status} badge={`${recent.length} EQ 7-day`} lastUpdated={Math.max(eqQuery.dataUpdatedAt, soilQuery.dataUpdatedAt)}>
      <div className="flex flex-col gap-2 h-full">
        <div className="h-[228px]">
          <Plot
            data={[
              {
                type: 'scatter',
                mode: 'markers',
                name: 'Earthquakes',
                x: earthquakes.map(e => e.longitude),
                y: earthquakes.map(e => e.latitude),
                marker: {
                  size: earthquakes.map(e => Math.max(4, e.magnitude * 4)),
                  color: '#ef4444',
                  opacity: 0.7,
                  line: { color: '#ff0000', width: 0.5 },
                },
                text: earthquakes.map(e => `M${e.magnitude} · ${e.place}<br>Depth: ${e.depth.toFixed(1)} km`),
                hoverinfo: 'text',
              },
              {
                type: 'scatter',
                mode: 'markers',
                name: 'Soil Susceptibility',
                x: soils.map(s => s.longitude),
                y: soils.map(s => s.latitude),
                marker: {
                  size: 14,
                  symbol: 'square',
                  color: soils.map(s => SUSC_COLOR[s.susceptibility] || '#64748b'),
                  opacity: 0.8,
                },
                text: soils.map(s => `${(s as unknown as { city?: string }).city || 'Site'}<br>Sand: ${s.sand?.toFixed(0)}% · Clay: ${s.clay?.toFixed(0)}%<br>Susceptibility: ${s.susceptibility}`),
                hoverinfo: 'text',
              },
            ]}
            layout={{
              paper_bgcolor: 'transparent', plot_bgcolor: 'transparent',
              height: 228,
              margin: { t: 8, b: 28, l: 38, r: 8 },
              font: { color: '#94a3b8', size: 10 },
              xaxis: { title: { text: 'Longitude' }, range: [-88.5, -84.9], gridcolor: '#1e293b' },
              yaxis: { title: { text: 'Latitude' }, range: [30.2, 35], gridcolor: '#1e293b' },
              legend: { orientation: 'h', y: -0.22, font: { size: 9 } },
            }}
            config={{ displayModeBar: false, responsive: true }}
            style={{ width: '100%', height: '228px' }}
            useResizeHandler
          />
        </div>
        <div className="flex gap-3 flex-wrap">
          {(['high', 'moderate', 'low'] as const).map(s => (
            <span key={s} className="flex items-center gap-1 text-xs text-slate-400">
              <span className="w-3 h-3 rounded-sm inline-block" style={{ background: SUSC_COLOR[s] }} />
              {s}
            </span>
          ))}
        </div>
      </div>
    </PanelCard>
  )
}
