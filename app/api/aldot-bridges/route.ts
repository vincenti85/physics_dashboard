import { NextResponse } from 'next/server'

const ALDOT_URL = 'https://aldotgis.dot.state.al.us/pubgis1/rest/services/Bridge_Services/Bridges_XY/MapServer/0/query'
const WIND_STATIONS = ['KMOB', 'KBHM', 'KHSV', 'KMGM']

interface AldotFeature {
  attributes: Record<string, unknown>
  geometry: { x: number; y: number }
}

interface WindObs {
  windSpeed: { value: number | null }
  windGust: { value: number | null }
}

export async function GET() {
  try {
    // Fetch high-risk bridges: steel material (material code 3/4) + long spans
    const params = new URLSearchParams({
      where: "MATERIAL IN (3,4,5) AND MAX_SPAN > 100",
      outFields: 'STRUCTURE_NUMBER,FAC_CARRIED,FEATURES_DESC,LAT_016,LONG_017,MATERIAL,STRUCTURE_TYPE,MAX_SPAN,YR_BLT_EST,SUB_COND,DECK_WIDTH',
      returnGeometry: 'true',
      f: 'json',
      resultRecordCount: '100',
    })

    const [bridgeRes, ...windResults] = await Promise.allSettled([
      fetch(`${ALDOT_URL}?${params}`, { next: { revalidate: 86400 } }),
      ...WIND_STATIONS.map(id =>
        fetch(`https://api.weather.gov/stations/${id}/observations/latest`, {
          headers: { Accept: 'application/geo+json' },
          next: { revalidate: 300 },
        })
      ),
    ])

    // Wind by station
    const windByStation: Record<string, { speed: number | null; gust: number | null }> = {}
    for (let i = 0; i < WIND_STATIONS.length; i++) {
      const result = windResults[i]
      if (result.status === 'fulfilled') {
        try {
          const j = await (result.value as Response).json()
          const obs: WindObs = j.properties
          windByStation[WIND_STATIONS[i]] = {
            speed: obs.windSpeed?.value,
            gust: obs.windGust?.value,
          }
        } catch { windByStation[WIND_STATIONS[i]] = { speed: null, gust: null } }
      }
    }

    if (bridgeRes.status === 'rejected') throw new Error('ALDOT fetch failed')
    const bridgeJson = await (bridgeRes.value as Response).json()
    const features: AldotFeature[] = bridgeJson.features || []

    const MATERIAL_MAP: Record<number, string> = { 1: 'Concrete', 2: 'Concrete Continuous', 3: 'Steel', 4: 'Steel Continuous', 5: 'Prestressed Concrete', 6: 'Prestressed Continuous' }
    const STRUCT_MAP: Record<number, string> = { 1: 'Slab', 2: 'Stringer/Beam', 3: 'Girder/Floorbeam', 4: 'Box Beam', 5: 'Frame', 6: 'Orthotropic', 7: 'Truss-Deck', 8: 'Truss-Thru', 9: 'Arch-Deck', 10: 'Arch-Thru', 11: 'Suspension', 12: 'Eyebar', 19: 'Other' }

    const bridges = features.map((f) => {
      const a = f.attributes
      const lat = typeof a.LAT_016 === 'number' ? a.LAT_016 / 1000000 : f.geometry?.y
      const lon = typeof a.LONG_017 === 'number' ? -(a.LONG_017 / 1000000) : f.geometry?.x
      const span = Number(a.MAX_SPAN) || 0
      const cond = Number(a.SUB_COND) || 5

      // Assign nearest wind station
      const nearestStation = (lat as number) < 31.5 ? 'KMOB' : (lat as number) < 33 ? 'KMGM' : (lat as number) < 33.8 ? 'KBHM' : 'KHSV'
      const wind = windByStation[nearestStation] || { speed: null, gust: null }

      // Risk: long span + steel + poor condition + high wind = critical
      const windMs = wind.speed ?? 0
      let oscillationRisk: 'critical' | 'high' | 'moderate' | 'low'
      if (span > 300 && cond <= 4 && windMs > 10) oscillationRisk = 'critical'
      else if (span > 200 && (cond <= 5 || windMs > 8)) oscillationRisk = 'high'
      else if (span > 100 || cond <= 6) oscillationRisk = 'moderate'
      else oscillationRisk = 'low'

      return {
        structureNumber: String(a.STRUCTURE_NUMBER || ''),
        facilityCarried: String(a.FAC_CARRIED || ''),
        featureCrossed: String(a.FEATURES_DESC || ''),
        latitude: lat,
        longitude: lon,
        material: MATERIAL_MAP[Number(a.MATERIAL)] || 'Unknown',
        structureType: STRUCT_MAP[Number(a.STRUCTURE_TYPE)] || 'Unknown',
        maxSpanLength: span,
        yearBuilt: Number(a.YR_BLT_EST) || 0,
        superstructureCondition: cond,
        deckWidth: Number(a.DECK_WIDTH) || 0,
        windSpeed: wind.speed,
        windGust: wind.gust,
        oscillationRisk,
      }
    })

    return NextResponse.json({ data: bridges, fetchedAt: new Date().toISOString() })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
