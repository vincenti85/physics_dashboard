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
const LiveClock = dynamic(() => import('@/components/ui/LiveClock').then(m => ({ default: m.LiveClock })), { ssr: false })

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#080810] text-slate-200">
      {/* Header */}
      <header className="border-b border-white/5 bg-[#0a0a18] px-4 py-3 flex items-center justify-between sticky top-0 z-50 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <h1 className="text-base font-bold tracking-wide text-slate-100">Alabama Natural Disaster Monitor</h1>
          <span className="hidden sm:inline text-xs text-slate-500 font-mono">10-PANEL · LIVE</span>
        </div>
        <LiveClock />
      </header>

      {/* 10-Panel Grid — h-full on every wrapper so PanelCard fills the row height */}
      <div className="p-3 grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-[340px]">
        {/* Row 1: Atmospheric */}
        <div className="lg:col-span-2 xl:col-span-2 h-full"><TornadoRadar /></div>
        <div className="h-full"><HurricaneSurge /></div>
        <div className="h-full"><TVADamMonitor /></div>

        {/* Row 2: Grid / Subsurface */}
        <div className="h-full"><PowerGridInertia /></div>
        <div className="h-full"><SinkholePreditor /></div>
        <div className="h-full"><SoilLiquefaction /></div>
        <div className="h-full"><UrbanHeatIsland /></div>

        {/* Row 3: Infrastructure / Lightning */}
        <div className="h-full"><BridgeOscillation /></div>
        <div className="h-full"><GroundwaterTracker /></div>
        <div className="lg:col-span-2 xl:col-span-2 h-full"><LightningPredictor /></div>
      </div>

      <footer className="text-center text-xs text-slate-600 py-4 border-t border-white/5">
        Data sources: NWS · NOAA CO-OPS · USGS NWIS · EIA · ISRIC SoilGrids · Open-Meteo · ALDOT · SPC · IEM NEXRAD
        · Railway backend for NEXRAD/GLM binary processing
      </footer>
    </main>
  )
}
