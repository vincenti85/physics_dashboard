'use client'
import { useQuery } from '@tanstack/react-query'
import type { EarthquakeEvent, SoilProfile } from '@/lib/types'

async function fetchEarthquakes(): Promise<EarthquakeEvent[]> {
  const url = 'https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minlatitude=30.2&maxlatitude=35&minlongitude=-88.5&maxlongitude=-84.9&minmagnitude=1.5&orderby=time&limit=50'
  const res = await fetch(url)
  if (!res.ok) throw new Error('USGS earthquake fetch failed')
  const json = await res.json()
  return (json.features || []).map((f: {
    id: string
    properties: { mag: number; place: string; time: number; mmi: number | null; alert: string | null }
    geometry: { coordinates: [number, number, number] }
  }) => ({
    id: f.id,
    magnitude: f.properties.mag,
    place: f.properties.place,
    latitude: f.geometry.coordinates[1],
    longitude: f.geometry.coordinates[0],
    depth: f.geometry.coordinates[2],
    time: f.properties.time,
    mmi: f.properties.mmi,
    alert: f.properties.alert,
    pga: null,
  }))
}

async function fetchSoilProfiles(): Promise<SoilProfile[]> {
  const res = await fetch('/api/usda-soil')
  if (!res.ok) return []
  const json = await res.json()
  return json.data
}

export function useLiquefaction() {
  const eqQuery = useQuery({
    queryKey: ['earthquakes-al'],
    queryFn: fetchEarthquakes,
    refetchInterval: 5 * 60_000,
  })
  const soilQuery = useQuery({
    queryKey: ['soil-profiles'],
    queryFn: fetchSoilProfiles,
    refetchInterval: 24 * 60 * 60_000,
    staleTime: 23 * 60 * 60_000,
  })
  return { eqQuery, soilQuery }
}
