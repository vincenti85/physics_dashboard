'use client'
import dynamic from 'next/dynamic'
import { useTornadoAlerts } from '@/hooks/useTornadoAlerts'
import { PanelCard } from '@/components/ui/PanelCard'
import { AlertBanner } from '@/components/ui/AlertBanner'

const LeafletMap = dynamic(() => import('@/components/maps/TornadoMap'), { ssr: false, loading: () => <div className="h-full bg-slate-900 rounded animate-pulse" /> })

export function TornadoRadar() {
  const { data: alerts = [], isLoading, isError, dataUpdatedAt } = useTornadoAlerts()
  const critical = alerts.filter(a => a.severity === 'Extreme' || a.severity === 'Severe')

  const status = isError ? 'error' : isLoading ? 'loading' : critical.length > 0 ? 'critical' : alerts.length > 0 ? 'warning' : 'nominal'

  return (
    <PanelCard title="Tornado Doppler Radar" subtitle="IEM NEXRAD + NWS Alerts" status={status} badge={alerts.length ? `${alerts.length} ACTIVE` : 'CLEAR'} lastUpdated={dataUpdatedAt}>
      <div className="flex flex-col h-full gap-2">
        <AlertBanner alerts={alerts} />
        <div className="h-[240px] rounded-lg overflow-hidden">
          <LeafletMap alerts={alerts} />
        </div>
        <div className="text-xs text-slate-500 text-right">NEXRAD: BMX · HTX · MOB · GWX</div>
      </div>
    </PanelCard>
  )
}
