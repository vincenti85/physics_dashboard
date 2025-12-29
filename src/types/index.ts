export interface EarthquakeData {
  id: string;
  magnitude: number;
  location: string;
  latitude: number;
  longitude: number;
  depth: number;
  timestamp: number;
  url?: string;
}

export interface WeatherData {
  id: string;
  city: string;
  latitude: number;
  longitude: number;
  temperature: number;
  pressure: number;
  humidity: number;
  windSpeed: number;
  description: string;
  timestamp: number;
}

export interface RadiationData {
  id: string;
  location: string;
  latitude: number;
  longitude: number;
  value: number;
  unit: string;
  timestamp: number;
  source: string;
}

export interface SyncLog {
  id: string;
  dataType: 'earthquake' | 'weather' | 'radiation';
  status: 'success' | 'failed';
  recordsCount: number;
  timestamp: number;
  errorMessage?: string;
}

export interface MapMarker {
  id: string;
  position: google.maps.LatLngLiteral;
  title: string;
  type: 'earthquake' | 'weather' | 'radiation';
  data: EarthquakeData | WeatherData | RadiationData;
}
