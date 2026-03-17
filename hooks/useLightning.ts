'use client'
import { useQuery } from '@tanstack/react-query'
import type { LightningOutlook, ConvectiveAlert } from '@/lib/types'

async function fetchLightningOutlook(): Promise<LightningOutlook[]> {
  // SPC Day 1-3 outlooks via NWS MapServer
  const url = 'https://mapservices.weather.noaa.gov/vector/rest/services/outlooks/SPC_wx_outlks/MapServer/1/query?where=1%3D1&outFields=*&f=geojson&geometry=-88.5,30.2,-84.9,35&geometryType=esriGeometryEnvelope&spatialRel=esriSpatialRelIntersects'
  const res = await fetch(url)
  if (!res.ok) return []
  const json = await res.json()
  return (json.features || []).map((f: {
    id: string
    properties: { DN: number; VALID: string; LABEL: string }
    geometry: unknown
  }) => ({
    id: String(f.id),
    day: 1 as const,
    validTime: f.properties.VALID,
    riskLevel: (f.properties.LABEL || 'TSTM') as LightningOutlook['riskLevel'],
    geometry: f.geometry as GeoJSON.Geometry,
  }))
}

async function fetchConvectiveAlerts(): Promise<ConvectiveAlert[]> {
  const res = await fetch(
    'https://api.weather.gov/alerts/active?area=AL&event=Severe%20Thunderstorm%20Warning,Tornado%20Warning,Flash%20Flood%20Warning',
    { headers: { Accept: 'application/geo+json' } }
  )
  if (!res.ok) return []
  const json = await res.json()
  return (json.features || []).map((f: {
    id: string
    properties: { event: string; headline: string; severity: string; onset: string; expires: string }
  }) => ({
    id: f.id,
    event: f.properties.event,
    headline: f.properties.headline,
    severity: f.properties.severity,
    onset: f.properties.onset,
    expires: f.properties.expires,
  }))
}

export function useLightning() {
  const outlookQuery = useQuery({
    queryKey: ['lightning-outlook'],
    queryFn: fetchLightningOutlook,
    refetchInterval: 60 * 60_000,
  })
  const alertQuery = useQuery({
    queryKey: ['convective-alerts'],
    queryFn: fetchConvectiveAlerts,
    refetchInterval: 2 * 60_000,
  })
  return { outlookQuery, alertQuery }
}
