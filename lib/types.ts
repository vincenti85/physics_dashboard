// Module 1: Tornado
export interface TornadoAlert {
  id: string
  headline: string
  severity: string
  urgency: string
  onset: string
  expires: string
  geometry: GeoJSON.Geometry | null
  description: string
}

// Module 2: Hurricane / Storm Surge
export interface TideReading {
  stationId: string
  stationName: string
  latitude: number
  longitude: number
  waterLevel: number   // feet MLLW
  minorFloodThreshold: number
  moderateFloodThreshold: number
  majorFloodThreshold: number
  timestamp: string
  trend: 'rising' | 'falling' | 'steady'
}

// Module 3: Dam Water
export interface DamGauge {
  siteCode: string
  siteName: string
  latitude: number
  longitude: number
  gageHeight: number   // feet
  discharge: number    // cfs
  timestamp: string
  floodStage: number
}

// Module 4: Grid Inertia
export interface GridGenerationMix {
  timestamp: string
  respondent: string
  fuelType: string
  value: number        // MWh
}

export interface GridInertiaProxy {
  timestamp: string
  synchronousShare: number  // 0-1 ratio
  totalGeneration: number   // MWh
  inertiaIndex: number     // derived metric
  riskLevel: 'low' | 'medium' | 'high'
}

// Module 5: Sinkhole
export interface GroundwaterSite {
  siteCode: string
  siteName: string
  latitude: number
  longitude: number
  depthToWater: number  // feet below land surface
  timestamp: string
  historicalMean: number | null
  anomaly: number | null  // deviation from mean
}

// Module 6: Soil Liquefaction
export interface EarthquakeEvent {
  id: string
  magnitude: number
  place: string
  latitude: number
  longitude: number
  depth: number       // km
  time: number        // Unix ms
  mmi: number | null
  alert: string | null
  pga: number | null  // peak ground acceleration
}

export interface SoilProfile {
  latitude: number
  longitude: number
  clay: number   // %
  sand: number   // %
  silt: number   // %
  susceptibility: 'very high' | 'high' | 'moderate' | 'low' | 'very low' | 'unknown'
}

// Module 7: Urban Heat Island
export interface UrbanHeatPoint {
  latitude: number
  longitude: number
  city: string
  temperature: number        // °F
  surfaceTemperature: number // °F
  timestamp: string
}

// Module 8: Bridge Oscillation
export interface BridgeRecord {
  structureNumber: string
  facilityCarried: string
  featureCrossed: string
  latitude: number
  longitude: number
  material: string
  structureType: string
  maxSpanLength: number   // feet
  yearBuilt: number
  superstructureCondition: number  // 0-9 NBI rating
  deckWidth: number
  windSpeed: number | null  // m/s current
  windGust: number | null
  oscillationRisk: 'critical' | 'high' | 'moderate' | 'low'
}

// Module 9: Groundwater Depletion (re-uses GroundwaterSite but with history)
export interface GroundwaterHistory {
  siteCode: string
  siteName: string
  latitude: number
  longitude: number
  readings: { timestamp: string; depthToWater: number }[]
  trend: 'depleting' | 'recovering' | 'stable'
  trendRate: number   // feet/year
}

// Module 10: Lightning
export interface LightningOutlook {
  id: string
  day: 1 | 2 | 3
  validTime: string
  riskLevel: 'TSTM' | 'MRGL' | 'SLGT' | 'ENH' | 'MDT' | 'HIGH'
  geometry: GeoJSON.Geometry
}

export interface ConvectiveAlert {
  id: string
  event: string
  headline: string
  severity: string
  onset: string
  expires: string
}
