import { NextResponse } from 'next/server'

const STATIONS = [
  { id: '8737048', name: 'Mobile Bay', lat: 30.652, lon: -88.058 },
  { id: '8735180', name: 'Dauphin Island', lat: 30.248, lon: -88.075 },
  { id: '8736897', name: 'Mobile State Docks', lat: 30.706, lon: -88.043 },
]

const FLOOD_THRESHOLDS: Record<string, { minor: number; moderate: number; major: number }> = {
  '8737048': { minor: 1.5, moderate: 2.5, major: 3.5 },
  '8735180': { minor: 1.5, moderate: 2.5, major: 3.5 },
  '8736897': { minor: 1.5, moderate: 2.5, major: 3.5 },
}

export async function GET() {
  try {
    const results = await Promise.allSettled(
      STATIONS.map(async (station) => {
        const url = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?station=${station.id}&product=water_level&datum=MLLW&time_zone=gmt&units=english&format=json&date=latest`
        const res = await fetch(url, { next: { revalidate: 60 } })
        const json = await res.json()
        const latest = json.data?.[0]
        if (!latest) throw new Error(`No data for station ${station.id}`)

        // Fetch recent readings to determine trend
        const now = new Date()
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
        const rangeUrl = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?station=${station.id}&product=water_level&datum=MLLW&time_zone=gmt&units=english&format=json&begin_date=${formatDate(oneHourAgo)}&end_date=${formatDate(now)}`
        const rangeRes = await fetch(rangeUrl, { next: { revalidate: 60 } })
        const rangeJson = await rangeRes.json()
        const readings: number[] = (rangeJson.data || []).map((d: { v: string }) => parseFloat(d.v)).filter((v: number) => !isNaN(v))

        let trend: 'rising' | 'falling' | 'steady' = 'steady'
        if (readings.length >= 2) {
          const delta = readings[readings.length - 1] - readings[0]
          if (delta > 0.05) trend = 'rising'
          else if (delta < -0.05) trend = 'falling'
        }

        const thresholds = FLOOD_THRESHOLDS[station.id]
        return {
          stationId: station.id,
          stationName: station.name,
          latitude: station.lat,
          longitude: station.lon,
          waterLevel: parseFloat(latest.v),
          minorFloodThreshold: thresholds.minor,
          moderateFloodThreshold: thresholds.moderate,
          majorFloodThreshold: thresholds.major,
          timestamp: latest.t,
          trend,
        }
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

function formatDate(d: Date) {
  return d.toISOString().replace(/[-:T]/g, '').slice(0, 12)
}
