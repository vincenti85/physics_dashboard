import { clsx } from 'clsx'

interface PanelCardProps {
  title: string
  subtitle?: string
  status?: 'nominal' | 'warning' | 'critical' | 'loading' | 'error'
  badge?: string
  children: React.ReactNode
  className?: string
  fullHeight?: boolean
}

const STATUS_STYLES = {
  nominal: 'border-green-500/30 shadow-green-500/5',
  warning: 'border-amber-500/40 shadow-amber-500/10',
  critical: 'border-red-500/50 shadow-red-500/15 animate-pulse',
  loading: 'border-slate-600/30',
  error: 'border-red-900/40',
}

const STATUS_DOT = {
  nominal: 'bg-green-400',
  warning: 'bg-amber-400 animate-pulse',
  critical: 'bg-red-400 animate-ping',
  loading: 'bg-slate-500 animate-pulse',
  error: 'bg-red-700',
}

export function PanelCard({ title, subtitle, status = 'loading', badge, children, className, fullHeight }: PanelCardProps) {
  return (
    <div className={clsx(
      'rounded-xl border bg-[#0f0f1a] shadow-lg flex flex-col overflow-hidden',
      STATUS_STYLES[status],
      fullHeight && 'h-full',
      className
    )}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-2 min-w-0">
          <span className={clsx('w-2 h-2 rounded-full flex-shrink-0', STATUS_DOT[status])} />
          <span className="text-sm font-semibold text-slate-200 truncate">{title}</span>
          {subtitle && <span className="text-xs text-slate-500 truncate hidden sm:block">· {subtitle}</span>}
        </div>
        {badge && (
          <span className="text-xs font-mono bg-white/5 text-slate-400 px-2 py-0.5 rounded-full flex-shrink-0 ml-2">
            {badge}
          </span>
        )}
      </div>
      <div className="flex-1 min-h-0 p-3">{children}</div>
    </div>
  )
}
