'use client'
import dynamic from 'next/dynamic'
import { useLightning } from '@/hooks/useLightning'
import { PanelCard } from '@/components/ui/PanelCard'
import { AlertBanner } from '@/components/ui/AlertBanner'

const LightningMap = dynamic(() => import('@/components/maps/LightningMap'), {
  ssr: false,
  loading: () => <div className="h-full bg-slate-900 rounded animate-pulse" />,
})

export function LightningPredictor() {
  const { outlookQuery, alertQuery } = useLightning()
  const outlooks = outlookQuery.data || []
  const alerts = alertQuery.data || []

  const severe = alerts.filter(a => a.severity === 'Extreme' || a.severity === 'Severe')
  const status = alertQuery.isError ? 'error' : alertQuery.isLoading ? 'loading' : severe.length > 0 ? 'critical' : alerts.length > 0 ? 'warning' : 'nominal'

  return (
    <PanelCard title="Lightning Strike Predictor" subtitle="SPC Outlooks · NWS Severe Alerts" status={status} badge={alerts.length ? `${alerts.length} ACTIVE` : 'CLEAR'} lastUpdated={Math.max(outlookQuery.dataUpdatedAt, alertQuery.dataUpdatedAt)}>
      <div className="flex flex-col gap-2 h-full">
        <AlertBanner alerts={alerts.map(a => ({ id: a.id, headline: a.headline, severity: a.severity, expires: a.expires }))} />
        {/* Explicit pixel height keeps the Leaflet map fully visible */}
        <div className="h-[230px] rounded-lg overflow-hidden">
          <LightningMap outlooks={outlooks} />
        </div>
        <div className="text-xs text-slate-500 flex justify-between mt-auto">
          <span>SPC Day 1–3 Convective Outlooks</span>
          <span>{outlooks.length} outlook zones</span>
        </div>
      </div>
    </PanelCard>
  )
}
