'use client'
import { useQuery } from '@tanstack/react-query'
import type { GridInertiaProxy } from '@/lib/types'

interface GridResponse {
  data: GridInertiaProxy[]
  demo?: boolean
}

async function fetchGridInertia(): Promise<GridResponse> {
  const res = await fetch('/api/eia-grid')
  if (!res.ok) throw new Error('EIA grid fetch failed')
  return res.json()
}

export function useGridInertia() {
  return useQuery({
    queryKey: ['grid-inertia'],
    queryFn: fetchGridInertia,
    refetchInterval: 15 * 60_000,
    staleTime: 14 * 60_000,
  })
}
