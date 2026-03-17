'use client'
import { useQuery } from '@tanstack/react-query'
import type { TideReading } from '@/lib/types'

async function fetchStormSurge(): Promise<TideReading[]> {
  const res = await fetch('/api/noaa-tides')
  if (!res.ok) throw new Error('NOAA tides fetch failed')
  const json = await res.json()
  return json.data
}

export function useStormSurge() {
  return useQuery({
    queryKey: ['storm-surge'],
    queryFn: fetchStormSurge,
    refetchInterval: 5 * 60_000,
    staleTime: 4 * 60_000,
  })
}
