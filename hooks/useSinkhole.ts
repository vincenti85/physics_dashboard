'use client'
import { useQuery } from '@tanstack/react-query'
import type { GroundwaterSite } from '@/lib/types'

async function fetchGroundwater(): Promise<GroundwaterSite[]> {
  const res = await fetch('/api/usgs-water?mode=groundwater')
  if (!res.ok) throw new Error('Groundwater fetch failed')
  const json = await res.json()
  return json.data
}

async function fetchPrecipitation() {
  // NWS gridpoint precip for Birmingham as AL proxy
  const ptRes = await fetch('https://api.weather.gov/points/33.52,-86.81')
  if (!ptRes.ok) return null
  const ptJson = await ptRes.json()
  const { gridId, gridX, gridY } = ptJson.properties
  const gridRes = await fetch(`https://api.weather.gov/gridpoints/${gridId}/${gridX},${gridY}`)
  if (!gridRes.ok) return null
  const gridJson = await gridRes.json()
  const precip = gridJson.properties?.quantitativePrecipitation
  return precip?.values?.slice(0, 12) || []
}

export function useSinkholeData() {
  const gwQuery = useQuery({
    queryKey: ['sinkhole-groundwater'],
    queryFn: fetchGroundwater,
    refetchInterval: 30 * 60_000,
  })
  const precipQuery = useQuery({
    queryKey: ['sinkhole-precip'],
    queryFn: fetchPrecipitation,
    refetchInterval: 60 * 60_000,
  })
  return { gwQuery, precipQuery }
}
