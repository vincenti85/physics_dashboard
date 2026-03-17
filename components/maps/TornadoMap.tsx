'use client'
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import type { TornadoAlert } from '@/lib/types'
import L from 'leaflet'
import { useEffect } from 'react'

// Fix default marker icons
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function RadarLayer() {
  const map = useMap()
  useEffect(() => {
    // IEM NEXRAD composite radar tile layer
    const radarLayer = L.tileLayer(
      'https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/nexrad-n0q-900913/{z}/{x}/{y}.png',
      { opacity: 0.7, attribution: '&copy; IEM NEXRAD' }
    )
    radarLayer.addTo(map)
    return () => { radarLayer.remove() }
  }, [map])
  return null
}

interface TornadoMapProps {
  alerts: TornadoAlert[]
}

export default function TornadoMap({ alerts }: TornadoMapProps) {
  const AL_CENTER: [number, number] = [32.8, -86.8]

  return (
    <MapContainer center={AL_CENTER} zoom={6} style={{ height: '100%', width: '100%', borderRadius: '8px' }} zoomControl={false}>
      <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; CartoDB' />
      <RadarLayer />
      {alerts.filter(a => a.geometry).map(alert => (
        <GeoJSON
          key={alert.id}
          data={{ type: 'Feature', geometry: alert.geometry!, properties: {} } as GeoJSON.Feature}
          style={{ color: alert.severity === 'Extreme' ? '#ef4444' : '#f59e0b', weight: 2, fillOpacity: 0.25 }}
        />
      ))}
    </MapContainer>
  )
}
