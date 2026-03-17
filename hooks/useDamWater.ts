'use client'
import { useQuery } from '@tanstack/react-query'
import type { DamGauge } from '@/lib/types'

async function fetchDamWater(): Promise<DamGauge[]> {
  const res = await fetch('/api/usgs-water?mode=dams')
  if (!res.ok) throw new Error('USGS dam fetch failed')
  const json = await res.json()
  return json.data
}

export function useDamWater() {
  return useQuery({
    queryKey: ['dam-water'],
    queryFn: fetchDamWater,
    refetchInterval: 5 * 60_000,
    staleTime: 4 * 60_000,
  })
}
