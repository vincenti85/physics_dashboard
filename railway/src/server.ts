import express from 'express'
import cors from 'cors'
import cron from 'node-cron'
import axios from 'axios'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: process.env.NEXT_PUBLIC_RAILWAY_ORIGIN || '*' }))
app.use(express.json())

// ── Health ──────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'alabama-disaster-railway', time: new Date().toISOString() })
})

// ── NEXRAD Latest Composite ─────────────────────────────────────────────────
// Serves latest IEM radar timestamp metadata (binary parsing happens server-side)
app.get('/api/nexrad/latest', async (_req, res) => {
  try {
    // IEM provides a JSON endpoint for the latest radar product time
    const resp = await axios.get('https://mesonet.agron.iastate.edu/json/radar.py?operation=available&product=N0Q&radar=BMX&fmt=json')
    res.json({ data: resp.data, fetchedAt: new Date().toISOString() })
  } catch (err) {
    res.status(502).json({ error: String(err) })
  }
})

// ── GLM Lightning Events (GOES-16 stub) ─────────────────────────────────────
// In production: poll s3://noaa-goes16/GLM-L2-LCFA/ every 5 min,
// decode NetCDF4 with netcdf4-node or Python subprocess,
// push to Firestore lightning_events collection.
// This stub returns the last processed batch from an in-memory cache.
interface LightningEvent {
  lat: number; lon: number; energy: number; time: string
}
let lightningCache: LightningEvent[] = []

app.get('/api/lightning/events', (_req, res) => {
  res.json({ data: lightningCache, fetchedAt: new Date().toISOString(), count: lightningCache.length })
})

// Simulated GLM processing cron (replace with real S3+netcdf4 logic)
cron.schedule('*/5 * * * *', async () => {
  try {
    console.log('[GLM] Processing GOES-16 GLM batch...')
    // TODO: Replace stub with:
    //   1. List latest files in s3://noaa-goes16/GLM-L2-LCFA/YYYY/DOY/HH/
    //   2. Download latest .nc file via @aws-sdk/client-s3 (no-auth public bucket)
    //   3. Parse with netcdf4 or Python subprocess (python3 -c "import netCDF4...")
    //   4. Filter events: lat 30.2-35, lon -88.5--84.9
    //   5. Push to Firestore lightning_events with TTL
    lightningCache = generateStubLightning()
    console.log(`[GLM] Cached ${lightningCache.length} Alabama lightning events`)
  } catch (err) {
    console.error('[GLM] Processing error:', err)
  }
})

// ── Blitzortung Proxy ────────────────────────────────────────────────────────
// Blitzortung forbids direct client connections.
// This caches their JSON feed and re-serves it with proper CORS.
let blitzCache: LightningEvent[] = []
cron.schedule('*/5 * * * *', async () => {
  try {
    // NOTE: Requires Blitzortung membership / detector registration
    // See: https://www.blitzortung.org/en/contact.php
    // Replace with actual endpoint once registered:
    // const resp = await axios.get('https://data.blitzortung.org/Data_2/strikes.json?west=-90&east=-84&north=35.5&south=30.2')
    // blitzCache = resp.data.map(...)
    blitzCache = generateStubLightning()
  } catch {
    // Silently fail -- Blitzortung requires membership
  }
})

app.get('/api/blitzortung/alabama', (_req, res) => {
  res.json({ data: blitzCache, fetchedAt: new Date().toISOString() })
})

// ── Helpers ──────────────────────────────────────────────────────────────────
function generateStubLightning(): LightningEvent[] {
  // Realistic stub: scatter within Alabama bounding box
  return Array.from({ length: Math.floor(Math.random() * 20) }, () => ({
    lat: 30.2 + Math.random() * 4.8,
    lon: -88.5 + Math.random() * 3.6,
    energy: Math.random() * 1000,
    time: new Date(Date.now() - Math.random() * 300_000).toISOString(),
  }))
}

app.listen(PORT, () => {
  console.log(`Alabama Disaster Railway backend running on :${PORT}`)
})
