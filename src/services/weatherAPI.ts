import axios from 'axios';
import { WeatherData } from '../types';

const WEATHER_API_URL = import.meta.env.VITE_OPENWEATHER_API_URL;
const WEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

export class WeatherAPI {
  private majorCities = [
    { name: 'Seoul', lat: 37.5665, lon: 126.9780 },
    { name: 'Tokyo', lat: 35.6762, lon: 139.6503 },
    { name: 'Beijing', lat: 39.9042, lon: 116.4074 },
    { name: 'New York', lat: 40.7128, lon: -74.0060 },
    { name: 'London', lat: 51.5074, lon: -0.1278 },
    { name: 'Paris', lat: 48.8566, lon: 2.3522 },
    { name: 'Sydney', lat: -33.8688, lon: 151.2093 },
    { name: 'Mumbai', lat: 19.0760, lon: 72.8777 }
  ];

  async fetchWeatherForCity(city: string, lat: number, lon: number): Promise<WeatherData> {
    try {
      const response = await axios.get(WEATHER_API_URL, {
        params: {
          lat,
          lon,
          appid: WEATHER_API_KEY,
          units: 'metric'
        }
      });

      const data = response.data;
      return {
        id: `${city}-${Date.now()}`,
        city,
        latitude: lat,
        longitude: lon,
        temperature: data.main.temp,
        pressure: data.main.pressure,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        description: data.weather[0].description,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error(`Error fetching weather data for ${city}:`, error);
      throw new Error(`Failed to fetch weather data for ${city}`);
    }
  }

  async fetchWeatherForMajorCities(): Promise<WeatherData[]> {
    const weatherPromises = this.majorCities.map(city =>
      this.fetchWeatherForCity(city.name, city.lat, city.lon)
    );

    try {
      return await Promise.all(weatherPromises);
    } catch (error) {
      console.error('Error fetching weather data for major cities:', error);
      return [];
    }
  }

  async fetchWeatherByCoordinates(lat: number, lon: number): Promise<WeatherData> {
    return this.fetchWeatherForCity('Custom Location', lat, lon);
  }
}

export const weatherAPI = new WeatherAPI();
