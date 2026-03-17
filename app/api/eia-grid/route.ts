import { NextResponse } from 'next/server'

const EIA_KEY = process.env.EIA_API_KEY || ''
const SYNCHRONOUS_FUELS = new Set(['NG', 'NUC', 'COL', 'WAT', 'OIL', 'GEO', 'OTH'])

export async function GET() {
  if (!EIA_KEY) {
    // Return demo data if no key configured
    return NextResponse.json({ data: getDemoData(), demo: true })
  }

  try {
    const url = new URL('https://api.eia.gov/v2/electricity/rto/fuel-type-data/data/')
    url.searchParams.set('api_key', EIA_KEY)
    url.searchParams.set('frequency', 'hourly')
    url.searchParams.append('data[0]', 'value')
    url.searchParams.append('facets[respondent][]', 'SOCO')
    url.searchParams.set('sort[0][column]', 'period')
    url.searchParams.set('sort[0][direction]', 'desc')
    url.searchParams.set('length', '48') // Last 48 hourly readings

    const res = await fetch(url.toString(), { next: { revalidate: 300 } })
    const json = await res.json()

    const rows: Array<{ period: string; fueltype: string; value: number }> = json.response?.data || []

    // Group by period, compute inertia proxy per timestamp
    const byPeriod = new Map<string, { sync: number; total: number; mix: Record<string, number> }>()
    for (const row of rows) {
      if (!byPeriod.has(row.period)) byPeriod.set(row.period, { sync: 0, total: 0, mix: {} })
      const entry = byPeriod.get(row.period)!
      const val = row.value ?? 0
      entry.total += val
      entry.mix[row.fueltype] = val
      if (SYNCHRONOUS_FUELS.has(row.fueltype)) entry.sync += val
    }

    const inertiaTimeline = Array.from(byPeriod.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([period, { sync, total, mix }]) => {
        const synchronousShare = total > 0 ? sync / total : 0
        const inertiaIndex = synchronousShare * 100
        const riskLevel = inertiaIndex > 70 ? 'low' : inertiaIndex > 40 ? 'medium' : 'high'
        return { timestamp: period, synchronousShare, totalGeneration: total, inertiaIndex, riskLevel, mix }
      })

    return NextResponse.json({ data: inertiaTimeline, fetchedAt: new Date().toISOString() })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

function getDemoData() {
  const now = Date.now()
  return Array.from({ length: 24 }, (_, i) => {
    const sync = 0.55 + Math.sin(i / 6) * 0.15
    return {
      timestamp: new Date(now - (23 - i) * 3600000).toISOString(),
      synchronousShare: sync,
      totalGeneration: 18000 + Math.random() * 4000,
      inertiaIndex: sync * 100,
      riskLevel: sync > 0.7 ? 'low' : sync > 0.4 ? 'medium' : 'high',
      mix: { NG: 8000, NUC: 3000, COL: 2000, SUN: 1500, WAT: 1000, WND: 500 },
    }
  })
}
