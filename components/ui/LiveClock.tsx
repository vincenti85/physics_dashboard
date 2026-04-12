'use client'
import { useState, useEffect } from 'react'

export function LiveClock() {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  if (!now) return <span className="text-xs text-slate-500 font-mono">--:--:-- UTC</span>

  return (
    <span className="text-xs text-slate-500 font-mono">
      {now.toUTCString().replace(' GMT', ' UTC')}
    </span>
  )
}
