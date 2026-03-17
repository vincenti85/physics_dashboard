import { NextResponse } from 'next/server'

const DAM_SITES = [
  { siteCode: '03575100', siteName: 'Wheeler Dam TW', lat: 34.574, lon: -87.376, floodStage: 35 },
  { siteCode: '03573500', siteName: 'Guntersville', lat: 34.365, lon: -86.278, floodStage: 595 },
  { siteCode: '03581500', siteName: 'Wilson Dam TW', lat: 34.735, lon: -87.636, floodStage: 30 },
]

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const mode = searchParams.get('mode') || 'dams'

  try {
    if (mode === 'groundwater') {
      const url = 'https://waterservices.usgs.gov/nwis/iv/?format=json&stateCd=AL&parameterCd=72019&siteType=GW&siteStatus=active'
      const res = await fetch(url, { next: { revalidate: 300 } })
      const json = await res.json()
      const sites = json.value?.timeSeries || []

      const data = sites.slice(0, 20).map((ts: {
        sourceInfo: { siteName: string; siteCode: Array<{ value: string }>; geoLocation: { geogLocation: { latitude: number; longitude: number } } }
        values: Array<{ value: Array<{ value: string; dateTime: string }> }>
      }) => {
        const latest = ts.values?.[0]?.value?.[0]
        return {
          siteCode: ts.sourceInfo?.siteCode?.[0]?.value,
          siteName: ts.sourceInfo?.siteName,
          latitude: ts.sourceInfo?.geoLocation?.geogLocation?.latitude,
          longitude: ts.sourceInfo?.geoLocation?.geogLocation?.longitude,
          depthToWater: latest ? parseFloat(latest.value) : null,
          timestamp: latest?.dateTime,
        }
      }).filter((s: { depthToWater: number | null }) => s.depthToWater !== null)

      return NextResponse.json({ data, mode: 'groundwater', fetchedAt: new Date().toISOString() })
    }

    // Dam mode: fetch gage height + discharge for each dam site
    const results = await Promise.allSettled(
      DAM_SITES.map(async (site) => {
        const url = `https://waterservices.usgs.gov/nwis/iv/?format=json&sites=${site.siteCode}&parameterCd=00065,00060`
        const res = await fetch(url, { next: { revalidate: 60 } })
        const json = await res.json()
        const series: Array<{
          variable: { variableCode: Array<{ value: string }> }
          values: Array<{ value: Array<{ value: string; dateTime: string }> }>
        }> = json.value?.timeSeries || []

        let gageHeight = 0, discharge = 0, timestamp = ''
        for (const ts of series) {
          const code = ts.variable?.variableCode?.[0]?.value
          const latest = ts.values?.[0]?.value?.[0]
          if (!latest) continue
          timestamp = latest.dateTime
          if (code === '00065') gageHeight = parseFloat(latest.value)
          if (code === '00060') discharge = parseFloat(latest.value)
        }

        return { ...site, gageHeight, discharge, timestamp }
      })
    )

    const data = results
      .filter(r => r.status === 'fulfilled')
      .map(r => (r as PromiseFulfilledResult<unknown>).value)

    return NextResponse.json({ data, mode: 'dams', fetchedAt: new Date().toISOString() })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
