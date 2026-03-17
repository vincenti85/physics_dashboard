'use client'
import dynamic from 'next/dynamic'
import { useSinkholeData } from '@/hooks/useSinkhole'
import { PanelCard } from '@/components/ui/PanelCard'

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false })

export function SinkholePreditor() {
  const { gwQuery } = useSinkholeData()
  const wells = gwQuery.data || []

  // Compute risk: shallow water table (< 10 ft) = elevated risk
  const highRisk = wells.filter(w => w.depthToWater < 10).length
  const status = gwQuery.isError ? 'error' : gwQuery.isLoading ? 'loading' : highRisk > 3 ? 'warning' : 'nominal'

  return (
    <PanelCard title="Sinkhole Predictor" subtitle="USGS GW Depth · NWS Precip · Karst Zones" status={status} badge={highRisk > 0 ? `${highRisk} HIGH-RISK SITES` : undefined}>
      <div className="flex flex-col gap-2 h-full">
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="bg-white/5 rounded-lg p-2">
            <div className="text-xs text-slate-400">Active GW Wells</div>
            <div className="text-xl font-bold text-slate-200">{wells.length}</div>
          </div>
          <div className="bg-white/5 rounded-lg p-2">
            <div className="text-xs text-slate-400">Shallow (&lt;10ft) Sites</div>
            <div className={`text-xl font-bold ${highRisk > 3 ? 'text-amber-400' : 'text-slate-200'}`}>{highRisk}</div>
          </div>
        </div>
        <div className="flex-1 min-h-[180px]">
          {wells.length > 0 && (
            <Plot
              data={[{
                type: 'scatter',
                mode: 'markers',
                name: 'GW Wells',
                x: wells.map(w => w.longitude),
                y: wells.map(w => w.latitude),
                marker: {
                  size: 8,
                  color: wells.map(w => w.depthToWater),
                  colorscale: [[0, '#ef4444'], [0.3, '#f59e0b'], [1, '#22c55e']] as [number, string][],
                  reversescale: true,
                  colorbar: { title: { text: 'Depth (ft)' }, thickness: 10, len: 0.7, tickfont: { size: 9 } },
                  showscale: true,
                },
                text: wells.map(w => `${w.siteName}<br>${w.depthToWater.toFixed(1)} ft below surface`),
                hoverinfo: 'text',
              }]}
              layout={{
                paper_bgcolor: 'transparent', plot_bgcolor: 'transparent',
                margin: { t: 10, b: 30, l: 40, r: 10 },
                font: { color: '#94a3b8', size: 10 },
                xaxis: { title: { text: 'Longitude' }, gridcolor: '#1e293b' },
                yaxis: { title: { text: 'Latitude' }, gridcolor: '#1e293b' },
                showlegend: false,
              }}
              config={{ displayModeBar: false, responsive: true }}
              style={{ width: '100%', height: '100%' }}
              useResizeHandler
            />
          )}
          {gwQuery.isLoading && <div className="text-slate-500 text-sm text-center py-8">Loading groundwater data&hellip;</div>}
        </div>
        <div className="text-xs text-slate-600 text-center">Karst coverage: North Alabama · Limestone formations</div>
      </div>
    </PanelCard>
  )
}
