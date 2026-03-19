import axios from 'axios';
import { EarthquakeData } from '../types';

const USGS_API_URL = import.meta.env.VITE_USGS_EARTHQUAKE_API ||
  'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson';

export class EarthquakeAPI {
  async fetchRecentEarthquakes(): Promise<EarthquakeData[]> {
    try {
      const response = await axios.get(USGS_API_URL);
      const features = response.data.features;

      return features.map((feature: any) => ({
        id: feature.id,
        magnitude: feature.properties.mag,
        location: feature.properties.place,
        latitude: feature.geometry.coordinates[1],
        longitude: feature.geometry.coordinates[0],
        depth: feature.geometry.coordinates[2],
        timestamp: feature.properties.time,
        url: feature.properties.url
      }));
    } catch (error) {
      console.error('Error fetching earthquake data:', error);
      throw new Error('Failed to fetch earthquake data from USGS');
    }
  }

  async fetchEarthquakesByMagnitude(minMagnitude: number): Promise<EarthquakeData[]> {
    const allEarthquakes = await this.fetchRecentEarthquakes();
    return allEarthquakes.filter(eq => eq.magnitude >= minMagnitude);
  }

  async fetchEarthquakesByRegion(
    minLat: number,
    maxLat: number,
    minLon: number,
    maxLon: number
  ): Promise<EarthquakeData[]> {
    const allEarthquakes = await this.fetchRecentEarthquakes();
    return allEarthquakes.filter(eq =>
      eq.latitude >= minLat &&
      eq.latitude <= maxLat &&
      eq.longitude >= minLon &&
      eq.longitude <= maxLon
    );
  }
}

export const earthquakeAPI = new EarthquakeAPI();
