'use client'
import dynamic from 'next/dynamic'
import { useGridInertia } from '@/hooks/useGridInertia'
import { PanelCard } from '@/components/ui/PanelCard'
import { StatusBadge } from '@/components/ui/StatusBadge'

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false })

export function PowerGridInertia() {
  const { data: response, isLoading, isError } = useGridInertia()
  const timeline = response?.data || []
  const latest = timeline[timeline.length - 1]

  const status = isError ? 'error' : isLoading ? 'loading' :
    !latest ? 'loading' :
    latest.riskLevel === 'high' ? 'critical' :
    latest.riskLevel === 'medium' ? 'warning' : 'nominal'

  return (
    <PanelCard
      title="Power Grid Inertia"
      subtitle="SOCO Balancing Authority · EIA v2"
      status={status}
      badge={response?.demo ? 'DEMO DATA' : latest ? `${latest.inertiaIndex.toFixed(0)}% sync` : undefined}
    >
      <div className="flex flex-col gap-3 h-full">
        {isLoading && <div className="text-slate-500 text-sm text-center py-8">Loading EIA generation mix&hellip;</div>}
        {latest && (
          <div className="flex gap-3 flex-wrap">
            <div className="bg-white/5 rounded-lg p-2 flex-1 min-w-[100px]">
              <div className="text-xs text-slate-400">Inertia Index</div>
              <div className={`text-2xl font-bold ${latest.riskLevel === 'high' ? 'text-red-400' : latest.riskLevel === 'medium' ? 'text-amber-400' : 'text-green-400'}`}>
                {latest.inertiaIndex.toFixed(1)}
              </div>
              <div className="text-xs text-slate-500">/ 100</div>
            </div>
            <div className="bg-white/5 rounded-lg p-2 flex-1 min-w-[100px]">
              <div className="text-xs text-slate-400">Sync Share</div>
              <div className="text-2xl font-bold text-slate-200">{(latest.synchronousShare * 100).toFixed(1)}%</div>
              <div className="text-xs text-slate-500">thermal+hydro+nuclear</div>
            </div>
            <div className="flex items-center">
              <StatusBadge
                label={latest.riskLevel === 'high' ? 'HIGH RISK' : latest.riskLevel === 'medium' ? 'MODERATE' : 'STABLE'}
                variant={latest.riskLevel === 'high' ? 'red' : latest.riskLevel === 'medium' ? 'amber' : 'green'}
              />
            </div>
          </div>
        )}
        <div className="flex-1 min-h-[160px]">
          <Plot
            data={[{
              type: 'scatter',
              mode: 'lines',
              fill: 'tozeroy',
              name: 'Inertia Index',
              x: timeline.map(t => t.timestamp),
              y: timeline.map(t => t.inertiaIndex),
              line: { color: '#3b82f6', width: 2 },
              fillcolor: 'rgba(59,130,246,0.15)',
            }, {
              type: 'scatter',
              mode: 'lines',
              name: 'Risk Threshold (40)',
              x: timeline.map(t => t.timestamp),
              y: timeline.map(() => 40),
              line: { color: '#ef4444', dash: 'dot', width: 1 },
            }]}
            layout={{
              paper_bgcolor: 'transparent', plot_bgcolor: 'transparent',
              margin: { t: 10, b: 30, l: 40, r: 10 },
              font: { color: '#94a3b8', size: 10 },
              xaxis: { showgrid: false, type: 'date' },
              yaxis: { range: [0, 100], gridcolor: '#1e293b', title: { text: 'Index' } },
              legend: { orientation: 'h', y: -0.2, font: { size: 10 } },
            }}
            config={{ displayModeBar: false, responsive: true }}
            style={{ width: '100%', height: '100%' }}
            useResizeHandler
          />
        </div>
        {response?.demo && <div className="text-xs text-amber-500/70 text-center">Configure EIA_API_KEY for live data</div>}
      </div>
    </PanelCard>
  )
}
