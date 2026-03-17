import dynamic from 'next/dynamic'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Alabama Disaster Monitor · 10-Panel Dashboard',
}

// All panels are lazy-loaded (heavy Leaflet + Plotly bundles)
const TornadoRadar       = dynamic(() => import('@/components/panels/TornadoRadar').then(m => ({ default: m.TornadoRadar })), { ssr: false })
const HurricaneSurge     = dynamic(() => import('@/components/panels/HurricaneSurge').then(m => ({ default: m.HurricaneSurge })), { ssr: false })
const TVADamMonitor      = dynamic(() => import('@/components/panels/TVADamMonitor').then(m => ({ default: m.TVADamMonitor })), { ssr: false })
const PowerGridInertia   = dynamic(() => import('@/components/panels/PowerGridInertia').then(m => ({ default: m.PowerGridInertia })), { ssr: false })
const SinkholePreditor   = dynamic(() => import('@/components/panels/SinkholePreditor').then(m => ({ default: m.SinkholePreditor })), { ssr: false })
const SoilLiquefaction   = dynamic(() => import('@/components/panels/SoilLiquefaction').then(m => ({ default: m.SoilLiquefaction })), { ssr: false })
const UrbanHeatIsland    = dynamic(() => import('@/components/panels/UrbanHeatIsland').then(m => ({ default: m.UrbanHeatIsland })), { ssr: false })
const BridgeOscillation  = dynamic(() => import('@/components/panels/BridgeOscillation').then(m => ({ default: m.BridgeOscillation })), { ssr: false })
const GroundwaterTracker = dynamic(() => import('@/components/panels/GroundwaterTracker').then(m => ({ default: m.GroundwaterTracker })), { ssr: false })
const LightningPredictor = dynamic(() => import('@/components/panels/LightningPredictor').then(m => ({ default: m.LightningPredictor })), { ssr: false })

export default function DashboardPage() {
  const now = new Date()
  return (
    <main className="min-h-screen bg-[#080810] text-slate-200">
      {/* Header */}
      <header className="border-b border-white/5 bg-[#0a0a18] px-4 py-3 flex items-center justify-between sticky top-0 z-50 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
          <h1 className="text-base font-bold tracking-wide text-slate-100">Alabama Natural Disaster Monitor</h1>
          <span className="hidden sm:inline text-xs text-slate-500 font-mono">10-PANEL · LIVE</span>
        </div>
        <div className="text-xs text-slate-500 font-mono">
          {now.toUTCString().replace(' GMT', ' UTC')}
        </div>
      </header>

      {/* 10-Panel Grid */}
      <div className="p-3 grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-[340px]">
        {/* Row 1: Weather / Atmospheric (span wider for maps) */}
        <div className="lg:col-span-2 xl:col-span-2 row-span-1"><TornadoRadar /></div>
        <div className="row-span-1"><HurricaneSurge /></div>
        <div className="row-span-1"><TVADamMonitor /></div>

        {/* Row 2: Grid / Subsurface */}
        <div className="row-span-1"><PowerGridInertia /></div>
        <div className="row-span-1"><SinkholePreditor /></div>
        <div className="row-span-1"><SoilLiquefaction /></div>
        <div className="row-span-1"><UrbanHeatIsland /></div>

        {/* Row 3: Infrastructure / Lightning */}
        <div className="row-span-1"><BridgeOscillation /></div>
        <div className="row-span-1"><GroundwaterTracker /></div>
        <div className="lg:col-span-2 xl:col-span-2 row-span-1"><LightningPredictor /></div>
      </div>

      <footer className="text-center text-xs text-slate-600 py-4 border-t border-white/5">
        Data sources: NWS · NOAA CO-OPS · USGS NWIS · EIA · ISRIC SoilGrids · Open-Meteo · ALDOT · SPC · IEM NEXRAD
        · Railway backend for NEXRAD/GLM binary processing
      </footer>
    </main>
  )
}
