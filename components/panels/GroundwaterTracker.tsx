'use client'
import dynamic from 'next/dynamic'
import { useGroundwater } from '@/hooks/useGroundwater'
import { PanelCard } from '@/components/ui/PanelCard'

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false })

export function GroundwaterTracker() {
  const { data: wells = [], isLoading, isError, dataUpdatedAt } = useGroundwater()

  const shallow = wells.filter(w => w.depthToWater < 15).length
  const deep = wells.filter(w => w.depthToWater > 50).length
  const status = isError ? 'error' : isLoading ? 'loading' : deep > wells.length * 0.4 ? 'warning' : 'nominal'

  const sorted = [...wells].sort((a, b) => a.depthToWater - b.depthToWater)

  return (
    <PanelCard title="Groundwater Depletion" subtitle="USGS NWIS · Alabama Aquifers" status={status} badge={`${wells.length} active wells`} lastUpdated={dataUpdatedAt}>
      <div className="flex flex-col gap-2 h-full">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-white/5 rounded p-2">
            <div className="text-xs text-slate-400">Shallow &lt;15ft</div>
            <div className="text-xl font-bold text-green-400">{shallow}</div>
          </div>
          <div className="bg-white/5 rounded p-2">
            <div className="text-xs text-slate-400">Total Active</div>
            <div className="text-xl font-bold text-slate-200">{wells.length}</div>
          </div>
          <div className="bg-white/5 rounded p-2">
            <div className="text-xs text-slate-400">Deep &gt;50ft</div>
            <div className={`text-xl font-bold ${deep > wells.length * 0.4 ? 'text-amber-400' : 'text-slate-200'}`}>{deep}</div>
          </div>
        </div>
        <div className="h-[200px]">
          {isLoading && <div className="text-slate-500 text-sm text-center py-8">Loading well data&hellip;</div>}
          {!isLoading && sorted.length > 0 && (
            <Plot
              data={[{
                type: 'bar',
                orientation: 'h',
                x: sorted.slice(0, 10).map(w => w.depthToWater),
                y: sorted.slice(0, 10).map(w => w.siteName.slice(0, 18)),
                marker: {
                  color: sorted.slice(0, 10).map(w =>
                    w.depthToWater < 15 ? '#22c55e' : w.depthToWater < 50 ? '#3b82f6' : '#f59e0b'
                  ),
                },
                text: sorted.slice(0, 10).map(w => `${w.depthToWater.toFixed(1)} ft`),
                textposition: 'outside',
                textfont: { size: 9, color: '#94a3b8' },
              }]}
              layout={{
                paper_bgcolor: 'transparent', plot_bgcolor: 'transparent',
                height: 200,
                margin: { t: 8, b: 28, l: 130, r: 48 },
                font: { color: '#94a3b8', size: 9 },
                xaxis: { title: { text: 'Depth (ft below surface)' }, gridcolor: '#1e293b' },
                yaxis: { tickfont: { size: 8 } },
              }}
              config={{ displayModeBar: false, responsive: true }}
              style={{ width: '100%', height: '200px' }}
              useResizeHandler
            />
          )}
        </div>
      </div>
    </PanelCard>
  )
}
