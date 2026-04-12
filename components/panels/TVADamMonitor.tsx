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

// Normalize each gauge to % of its own flood stage so the chart
// doesn't collapse when Guntersville (595 ft) dwarfs Wheeler (35 ft)
function pctOfFloodStage(g: DamGauge) {
  return g.floodStage > 0 ? Math.min(100, (g.gageHeight / g.floodStage) * 100) : 0
}

export function TVADamMonitor() {
  const { data: gauges = [], isLoading, isError, dataUpdatedAt } = useDamWater()
  const worst = gauges.some(g => damStatus(g) === 'critical') ? 'critical'
    : gauges.some(g => damStatus(g) === 'warning') ? 'warning' : 'nominal'

  return (
    <PanelCard title="TVA Dam Water Monitor" subtitle="USGS Gauges · Wheeler · Wilson · Guntersville" status={isError ? 'error' : isLoading ? 'loading' : worst} lastUpdated={dataUpdatedAt}>
      <div className="flex flex-col gap-2 h-full">
        {isLoading && <div className="text-slate-500 text-sm text-center py-8">Loading USGS gauges&hellip;</div>}
        {isError && <div className="text-red-400 text-sm text-center py-8">USGS unavailable</div>}
        {!isLoading && !isError && (
          <>
            <div className="grid grid-cols-3 gap-2">
              {gauges.map(g => (
                <div key={g.siteCode} className="bg-white/5 rounded-lg p-2 text-center">
                  <div className="text-[10px] text-slate-400 truncate">{g.siteName.replace(/ (AL|TW)$/g, '')}</div>
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
            {/* Chart shows % of flood stage — apples-to-apples across dams with different datums */}
            <div className="h-[170px]">
              <Plot
                data={[
                  {
                    type: 'bar',
                    name: 'Level (% flood stage)',
                    x: gauges.map(g => g.siteName.replace(/ (AL|TW)$/, '')),
                    y: gauges.map(pctOfFloodStage),
                    marker: { color: gauges.map(g => damStatus(g) === 'critical' ? '#ef4444' : damStatus(g) === 'warning' ? '#f59e0b' : '#3b82f6') },
                    text: gauges.map(g => `${pctOfFloodStage(g).toFixed(1)}%`),
                    textposition: 'outside',
                    textfont: { size: 10, color: '#94a3b8' },
                  },
                  {
                    type: 'scatter',
                    mode: 'lines',
                    name: 'Flood Stage (100%)',
                    x: gauges.map(g => g.siteName.replace(/ (AL|TW)$/, '')),
                    y: gauges.map(() => 100),
                    line: { color: '#ef4444', dash: 'dash', width: 1.5 },
                  },
                ]}
                layout={{
                  paper_bgcolor: 'transparent', plot_bgcolor: 'transparent',
                  height: 170,
                  margin: { t: 20, b: 36, l: 38, r: 8 },
                  font: { color: '#94a3b8', size: 10 },
                  yaxis: { title: { text: '% of flood stage' }, gridcolor: '#1e293b', range: [0, 115] },
                  legend: { orientation: 'h', y: -0.3, font: { size: 9 } },
                  barmode: 'group',
                }}
                config={{ displayModeBar: false, responsive: true }}
                style={{ width: '100%', height: '170px' }}
                useResizeHandler
              />
            </div>
          </>
        )}
      </div>
    </PanelCard>
  )
}
