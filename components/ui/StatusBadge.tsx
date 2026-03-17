import { clsx } from 'clsx'

interface StatusBadgeProps {
  label: string
  variant?: 'red' | 'amber' | 'green' | 'blue' | 'slate'
  size?: 'sm' | 'xs'
}

const VARIANTS = {
  red: 'bg-red-500/20 text-red-300 border-red-500/30',
  amber: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  green: 'bg-green-500/20 text-green-300 border-green-500/30',
  blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  slate: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
}

export function StatusBadge({ label, variant = 'slate', size = 'sm' }: StatusBadgeProps) {
  return (
    <span className={clsx(
      'inline-flex items-center border rounded-full font-medium uppercase tracking-wider',
      VARIANTS[variant],
      size === 'xs' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
    )}>
      {label}
    </span>
  )
}
