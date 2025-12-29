import { RadiationData } from '../types';

export class RadiationAPI {
  private mockRadiationSites = [
    { location: 'Fukushima, Japan', lat: 37.4213, lon: 141.0327 },
    { location: 'Chernobyl, Ukraine', lat: 51.3892, lon: 30.0993 },
    { location: 'Tokyo, Japan', lat: 35.6762, lon: 139.6503 },
    { location: 'Seoul, South Korea', lat: 37.5665, lon: 126.9780 },
    { location: 'Paris, France', lat: 48.8566, lon: 2.3522 },
    { location: 'New York, USA', lat: 40.7128, lon: -74.0060 }
  ];

  async fetchRadiationData(): Promise<RadiationData[]> {
    return this.mockRadiationSites.map((site, index) => {
      const baseValue = site.location.includes('Fukushima') ? 0.5 :
                       site.location.includes('Chernobyl') ? 0.3 :
                       0.1;

      const randomVariation = (Math.random() - 0.5) * 0.05;
      const value = Math.max(0, baseValue + randomVariation);

      return {
        id: `rad-${index}-${Date.now()}`,
        location: site.location,
        latitude: site.lat,
        longitude: site.lon,
        value: parseFloat(value.toFixed(3)),
        unit: 'μSv/h',
        timestamp: Date.now(),
        source: 'Simulated Data'
      };
    });
  }

  async fetchRadiationByLocation(lat: number, lon: number): Promise<RadiationData> {
    const baseValue = 0.1;
    const randomVariation = (Math.random() - 0.5) * 0.05;
    const value = Math.max(0, baseValue + randomVariation);

    return {
      id: `rad-custom-${Date.now()}`,
      location: `Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`,
      latitude: lat,
      longitude: lon,
      value: parseFloat(value.toFixed(3)),
      unit: 'μSv/h',
      timestamp: Date.now(),
      source: 'Simulated Data'
    };
  }
}

export const radiationAPI = new RadiationAPI();
