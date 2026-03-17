import { NextResponse } from 'next/server'

// Sample grid points across Alabama (lat, lon)
const AL_SAMPLE_POINTS = [
  { lat: 30.7, lon: -88.1, city: 'Mobile' },
  { lat: 31.5, lon: -87.5, city: 'Evergreen' },
  { lat: 32.4, lon: -86.9, city: 'Montgomery' },
  { lat: 33.5, lon: -86.8, city: 'Birmingham' },
  { lat: 34.7, lon: -86.6, city: 'Huntsville' },
  { lat: 32.3, lon: -86.3, city: 'Tuskegee' },
  { lat: 33.2, lon: -87.6, city: 'Tuscaloosa' },
  { lat: 34.2, lon: -85.8, city: 'Anniston' },
]

export async function GET() {
  try {
    // Use ISRIC SoilGrids for CORS-friendly soil data (5 req/min limit)
    const results = await Promise.allSettled(
      AL_SAMPLE_POINTS.slice(0, 5).map(async (pt) => {
        const url = `https://rest.isric.org/soilgrids/v2.0/properties/query?lon=${pt.lon}&lat=${pt.lat}&property=clay&property=sand&property=silt&depth=0-5cm&value=mean`
        const res = await fetch(url, { next: { revalidate: 3600 } })
        const json = await res.json()

        const layers = json.properties?.layers || []
        const clay = layers.find((l: { name: string }) => l.name === 'clay')?.depths?.[0]?.values?.mean ?? null
        const sand = layers.find((l: { name: string }) => l.name === 'sand')?.depths?.[0]?.values?.mean ?? null
        const silt = layers.find((l: { name: string }) => l.name === 'silt')?.depths?.[0]?.values?.mean ?? null

        // SoilGrids returns values * 10 (g/kg), divide by 10 for %
        const clayPct = clay !== null ? clay / 10 : null
        const sandPct = sand !== null ? sand / 10 : null
        const siltPct = silt !== null ? silt / 10 : null

        // Simple susceptibility heuristic:
        // High clay + low sand → lower liq risk; High sand + low clay → higher liq risk
        let susceptibility: string
        if (sandPct === null || clayPct === null) susceptibility = 'unknown'
        else if (sandPct > 60 && clayPct < 15) susceptibility = 'high'
        else if (sandPct > 40 && clayPct < 25) susceptibility = 'moderate'
        else if (clayPct > 35) susceptibility = 'low'
        else susceptibility = 'moderate'

        return { latitude: pt.lat, longitude: pt.lon, city: pt.city, clay: clayPct, sand: sandPct, silt: siltPct, susceptibility }
      })
    )

    const data = results
      .filter(r => r.status === 'fulfilled')
      .map(r => (r as PromiseFulfilledResult<unknown>).value)

    return NextResponse.json({ data, fetchedAt: new Date().toISOString() })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
