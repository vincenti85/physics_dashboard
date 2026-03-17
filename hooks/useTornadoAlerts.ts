'use client'
import { useQuery } from '@tanstack/react-query'
import type { TornadoAlert } from '@/lib/types'

interface NWSFeature {
  id: string
  properties: {
    headline: string
    severity: string
    urgency: string
    onset: string
    expires: string
    description: string
  }
  geometry: unknown
}

async function fetchTornadoAlerts(): Promise<TornadoAlert[]> {
  const res = await fetch(
    'https://api.weather.gov/alerts/active?area=AL&event=Tornado%20Warning,Tornado%20Watch',
    { headers: { Accept: 'application/geo+json' } }
  )
  if (!res.ok) throw new Error('NWS alerts fetch failed')
  const json = await res.json()
  return (json.features || []).map((f: NWSFeature) => ({
    id: f.id,
    headline: f.properties.headline,
    severity: f.properties.severity,
    urgency: f.properties.urgency,
    onset: f.properties.onset,
    expires: f.properties.expires,
    geometry: f.geometry as GeoJSON.Geometry | null,
    description: f.properties.description,
  }))
}

export function useTornadoAlerts() {
  return useQuery({
    queryKey: ['tornado-alerts'],
    queryFn: fetchTornadoAlerts,
    refetchInterval: 60_000,
    staleTime: 30_000,
  })
}
