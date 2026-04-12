'use client'
import dynamic from 'next/dynamic'
import { useStormSurge } from '@/hooks/useStormSurge'
import { PanelCard } from '@/components/ui/PanelCard'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { TideReading } from '@/lib/types'

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false })

function floodLevel(r: TideReading): 'critical' | 'warning' | 'nominal' {
  if (r.waterLevel >= r.majorFloodThreshold) return 'critical'
  if (r.waterLevel >= r.minorFloodThreshold) return 'warning'
  return 'nominal'
}

export function HurricaneSurge() {
  const { data: stations = [], isLoading, isError, dataUpdatedAt } = useStormSurge()
  const maxLevel = floodLevel(stations.reduce((a, b) =>
    (b.waterLevel / b.minorFloodThreshold) > (a.waterLevel / a.minorFloodThreshold) ? b : a,
    stations[0] || { waterLevel: 0, minorFloodThreshold: 1, majorFloodThreshold: 2, moderateFloodThreshold: 1.5 } as TideReading
  ))

  return (
    <PanelCard title="Hurricane Storm Surge" subtitle="NOAA CO-OPS Alabama Stations" status={isError ? 'error' : isLoading ? 'loading' : maxLevel === 'critical' ? 'critical' : maxLevel === 'warning' ? 'warning' : 'nominal'} lastUpdated={dataUpdatedAt}>
      <div className="flex flex-col gap-2 h-full">
        {isLoading && <div className="text-center text-slate-500 text-sm py-8">Fetching tide gauges&hellip;</div>}
        {isError && <div className="text-center text-red-400 text-sm py-8">NOAA CO-OPS unavailable</div>}
        {!isLoading && !isError && (
          <>
            <div className="flex gap-2">
              {stations.map(s => (
                <div key={s.stationId} className="flex-1 bg-white/5 rounded-lg p-2">
                  <div className="text-[10px] text-slate-400 truncate">{s.stationName}</div>
                  <div className="text-xl font-bold text-slate-100">{s.waterLevel.toFixed(2)}<span className="text-xs text-slate-500 ml-1">ft</span></div>
                  <StatusBadge
                    label={floodLevel(s) === 'critical' ? 'MAJOR FLOOD' : floodLevel(s) === 'warning' ? 'MINOR FLOOD' : 'NORMAL'}
                    variant={floodLevel(s) === 'critical' ? 'red' : floodLevel(s) === 'warning' ? 'amber' : 'green'}
                    size="xs"
                  />
                  <div className="text-[10px] text-slate-500 mt-0.5">{s.trend === 'rising' ? '↑' : s.trend === 'falling' ? '↓' : '→'} {s.trend}</div>
                </div>
              ))}
            </div>
            <div className="h-[160px]">
              <Plot
                data={[{
                  type: 'bar',
                  x: stations.map(s => s.stationName),
                  y: stations.map(s => s.waterLevel),
                  marker: { color: stations.map(s => floodLevel(s) === 'critical' ? '#ef4444' : floodLevel(s) === 'warning' ? '#f59e0b' : '#22c55e') },
                  name: 'Water Level (ft)',
                }]}
                layout={{
                  paper_bgcolor: 'transparent', plot_bgcolor: 'transparent',
                  height: 160,
                  margin: { t: 8, b: 36, l: 38, r: 8 },
                  font: { color: '#94a3b8', size: 11 },
                  xaxis: { tickfont: { size: 10 } },
                  yaxis: { title: { text: 'ft MLLW' }, gridcolor: '#1e293b' },
                  showlegend: false,
                }}
                config={{ displayModeBar: false, responsive: true }}
                style={{ width: '100%', height: '160px' }}
                useResizeHandler
              />
            </div>
          </>
        )}
      </div>
    </PanelCard>
  )
}
