'use client'
import dynamic from 'next/dynamic'
import { useDamWater } from '@/hooks/useDamWater'
import { PanelCard } from '@/components/ui/PanelCard'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { DamGauge } from '@/lib/types'

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false })

function damStatus(g: DamGauge): 'critical' | 'warning' | 'nominal' {
  if (g.gageHeight >= g.floodStage) return 'critical'
  if (g.gageHeight >= g.floodStage * 0.85) return 'warning'
  return 'nominal'
}

export function TVADamMonitor() {
  const { data: gauges = [], isLoading, isError } = useDamWater()
  const worst = gauges.some(g => damStatus(g) === 'critical') ? 'critical' : gauges.some(g => damStatus(g) === 'warning') ? 'warning' : 'nominal'

  return (
    <PanelCard title="TVA Dam Water Monitor" subtitle="USGS Gauges · Wheeler · Wilson · Guntersville" status={isError ? 'error' : isLoading ? 'loading' : worst}>
      <div className="flex flex-col gap-3 h-full">
        {isLoading && <div className="text-slate-500 text-sm text-center py-8">Loading USGS gauges&hellip;</div>}
        {isError && <div className="text-red-400 text-sm text-center py-8">USGS unavailable</div>}
        {!isLoading && !isError && (
          <>
            <div className="grid grid-cols-3 gap-2">
              {gauges.map(g => (
                <div key={g.siteCode} className="bg-white/5 rounded-lg p-2 text-center">
                  <div className="text-[10px] text-slate-400 truncate">{g.siteName.replace(' AL', '')}</div>
                  <div className="text-lg font-bold text-slate-100">{g.gageHeight.toFixed(1)}<span className="text-xs text-slate-500"> ft</span></div>
                  <div className="text-xs text-slate-500">{(g.discharge / 1000).toFixed(1)}k cfs</div>
                  <StatusBadge
                    label={damStatus(g) === 'critical' ? 'FLOOD' : damStatus(g) === 'warning' ? 'WATCH' : 'OK'}
                    variant={damStatus(g) === 'critical' ? 'red' : damStatus(g) === 'warning' ? 'amber' : 'green'}
                    size="xs"
                  />
                </div>
              ))}
            </div>
            <div className="flex-1 min-h-[150px]">
              <Plot
                data={[
                  {
                    type: 'bar',
                    name: 'Gage Height',
                    x: gauges.map(g => g.siteName.replace(/ AL$/, '')),
                    y: gauges.map(g => g.gageHeight),
                    yaxis: 'y',
                    marker: { color: gauges.map(g => damStatus(g) === 'critical' ? '#ef4444' : damStatus(g) === 'warning' ? '#f59e0b' : '#3b82f6') },
                  },
                  {
                    type: 'scatter',
                    mode: 'lines',
                    name: 'Flood Stage',
                    x: gauges.map(g => g.siteName.replace(/ AL$/, '')),
                    y: gauges.map(g => g.floodStage),
                    yaxis: 'y',
                    line: { color: '#ef4444', dash: 'dash', width: 1.5 },
                  },
                ]}
                layout={{
                  paper_bgcolor: 'transparent', plot_bgcolor: 'transparent',
                  margin: { t: 10, b: 40, l: 40, r: 10 },
                  font: { color: '#94a3b8', size: 11 },
                  yaxis: { title: { text: 'ft' }, gridcolor: '#1e293b' },
                  legend: { orientation: 'h', y: -0.25, font: { size: 10 } },
                  barmode: 'group',
                }}
                config={{ displayModeBar: false, responsive: true }}
                style={{ width: '100%', height: '100%' }}
                useResizeHandler
              />
            </div>
          </>
        )}
      </div>
    </PanelCard>
  )
}
