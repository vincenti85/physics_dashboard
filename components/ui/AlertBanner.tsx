'use client'
import { clsx } from 'clsx'

interface Alert {
  id: string
  headline: string
  severity: string
  expires: string
}

export function AlertBanner({ alerts }: { alerts: Alert[] }) {
  if (!alerts.length) return null
  const critical = alerts.filter(a => a.severity === 'Extreme' || a.severity === 'Severe')

  return (
    <div className={clsx(
      'rounded-lg border px-4 py-3 mb-2',
      critical.length ? 'border-red-500/50 bg-red-950/40' : 'border-amber-500/40 bg-amber-950/30'
    )}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-red-400 text-sm font-bold">&#9888; ACTIVE ALERTS ({alerts.length})</span>
      </div>
      <ul className="space-y-0.5">
        {alerts.slice(0, 3).map(a => (
          <li key={a.id} className="text-xs text-slate-300 truncate">
            {a.headline}
          </li>
        ))}
        {alerts.length > 3 && (
          <li className="text-xs text-slate-500">+{alerts.length - 3} more alerts</li>
        )}
      </ul>
    </div>
  )
}
