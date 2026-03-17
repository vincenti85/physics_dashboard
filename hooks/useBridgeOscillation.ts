'use client'
import { useQuery } from '@tanstack/react-query'
import type { BridgeRecord } from '@/lib/types'

async function fetchBridges(): Promise<BridgeRecord[]> {
  const res = await fetch('/api/aldot-bridges')
  if (!res.ok) throw new Error('ALDOT bridge fetch failed')
  const json = await res.json()
  return json.data
}

export function useBridgeOscillation() {
  return useQuery({
    queryKey: ['bridge-oscillation'],
    queryFn: fetchBridges,
    refetchInterval: 5 * 60_000,
    staleTime: 4 * 60_000,
  })
}
