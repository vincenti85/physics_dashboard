'use client'
import { useQuery } from '@tanstack/react-query'
import type { GroundwaterSite } from '@/lib/types'

async function fetchGroundwaterAll(): Promise<GroundwaterSite[]> {
  const res = await fetch('/api/usgs-water?mode=groundwater')
  if (!res.ok) throw new Error('Groundwater fetch failed')
  const json = await res.json()
  return json.data
}

export function useGroundwater() {
  return useQuery({
    queryKey: ['groundwater-depletion'],
    queryFn: fetchGroundwaterAll,
    refetchInterval: 60 * 60_000,
    staleTime: 55 * 60_000,
  })
}
