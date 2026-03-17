'use client'
import { useQuery } from '@tanstack/react-query'
import type { UrbanHeatPoint } from '@/lib/types'

const AL_CITIES = [
  { city: 'Birmingham', lat: 33.52, lon: -86.81 },
  { city: 'Huntsville', lat: 34.73, lon: -86.59 },
  { city: 'Mobile', lat: 30.69, lon: -88.04 },
  { city: 'Montgomery', lat: 32.36, lon: -86.30 },
  { city: 'Tuscaloosa', lat: 33.21, lon: -87.57 },
  { city: 'Auburn', lat: 32.61, lon: -85.48 },
]

async function fetchHeatData(): Promise<UrbanHeatPoint[]> {
  const urls = AL_CITIES.map(c =>
    `https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lon}&current=temperature_2m,surface_temperature&temperature_unit=fahrenheit&timezone=America/Chicago`
  )
  const results = await Promise.allSettled(urls.map(u => fetch(u).then(r => r.json())))
  return results.map((r, i) => {
    const city = AL_CITIES[i]
    if (r.status === 'rejected') return { latitude: city.lat, longitude: city.lon, city: city.city, temperature: 0, surfaceTemperature: 0, timestamp: new Date().toISOString() }
    const current = r.value.current || {}
    return {
      latitude: city.lat,
      longitude: city.lon,
      city: city.city,
      temperature: current.temperature_2m ?? 0,
      surfaceTemperature: current.surface_temperature ?? 0,
      timestamp: current.time ?? new Date().toISOString(),
    }
  })
}

export function useHeatIsland() {
  return useQuery({
    queryKey: ['heat-island'],
    queryFn: fetchHeatData,
    refetchInterval: 30 * 60_000,
    staleTime: 25 * 60_000,
  })
}
