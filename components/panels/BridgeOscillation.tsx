'use client'
import { useBridgeOscillation } from '@/hooks/useBridgeOscillation'
import { PanelCard } from '@/components/ui/PanelCard'
import { StatusBadge } from '@/components/ui/StatusBadge'

const RISK_COLOR: Record<string, 'red' | 'amber' | 'green' | 'slate'> = {
  critical: 'red', high: 'amber', moderate: 'green', low: 'slate'
}

export function BridgeOscillation() {
  const { data: bridges = [], isLoading, isError } = useBridgeOscillation()

  const critical = bridges.filter(b => b.oscillationRisk === 'critical').length
  const high = bridges.filter(b => b.oscillationRisk === 'high').length
  const status = isError ? 'error' : isLoading ? 'loading' : critical > 0 ? 'critical' : high > 0 ? 'warning' : 'nominal'

  const sorted = [...bridges].sort((a, b) => {
    const order = { critical: 0, high: 1, moderate: 2, low: 3 }
    return order[a.oscillationRisk] - order[b.oscillationRisk]
  })

  return (
    <PanelCard title="Bridge Oscillation Risk" subtitle="ALDOT GIS · NBI · NWS Wind" status={status} badge={critical > 0 ? `${critical} CRITICAL` : `${high} HIGH RISK`}>
      <div className="flex flex-col gap-2 h-full">
        <div className="grid grid-cols-4 gap-1 text-center">
          {(['critical', 'high', 'moderate', 'low'] as const).map(r => (
            <div key={r} className="bg-white/5 rounded p-1.5">
              <div className="text-lg font-bold" style={{ color: r === 'critical' ? '#ef4444' : r === 'high' ? '#f59e0b' : r === 'moderate' ? '#22c55e' : '#64748b' }}>
                {bridges.filter(b => b.oscillationRisk === r).length}
              </div>
              <div className="text-[10px] text-slate-500 capitalize">{r}</div>
            </div>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
          {isLoading && <div className="text-slate-500 text-sm text-center py-6">Loading bridge data&hellip;</div>}
          {sorted.slice(0, 8).map(b => (
            <div key={b.structureNumber} className="flex items-center gap-2 bg-white/[0.03] rounded px-2 py-1.5">
              <StatusBadge label={b.oscillationRisk} variant={RISK_COLOR[b.oscillationRisk]} size="xs" />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-slate-300 truncate">{b.facilityCarried || b.structureNumber}</div>
                <div className="text-[10px] text-slate-500">{b.material} · {b.maxSpanLength}ft span · {b.yearBuilt}</div>
              </div>
              <div className="text-xs text-slate-400 flex-shrink-0">
                {b.windSpeed !== null ? `${b.windSpeed?.toFixed(1)} m/s` : '–'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PanelCard>
  )
}
