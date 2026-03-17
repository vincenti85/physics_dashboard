'use client'
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import type { LightningOutlook } from '@/lib/types'
import L from 'leaflet'

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const RISK_COLORS: Record<string, string> = {
  TSTM: '#64748b', MRGL: '#22c55e', SLGT: '#f59e0b',
  ENH: '#f97316', MDT: '#ef4444', HIGH: '#9333ea',
}

export default function LightningMap({ outlooks }: { outlooks: LightningOutlook[] }) {
  const AL_CENTER: [number, number] = [32.8, -86.8]
  return (
    <MapContainer center={AL_CENTER} zoom={6} style={{ height: '100%', width: '100%', borderRadius: '8px' }} zoomControl={false}>
      <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; CartoDB' />
      {outlooks.filter(o => o.geometry).map(o => (
        <GeoJSON
          key={o.id}
          data={{ type: 'Feature', geometry: o.geometry, properties: {} } as GeoJSON.Feature}
          style={{
            color: RISK_COLORS[o.riskLevel] || '#64748b',
            weight: 2,
            fillOpacity: 0.3,
            fillColor: RISK_COLORS[o.riskLevel] || '#64748b',
          }}
        />
      ))}
    </MapContainer>
  )
}
