import { admin, db, SyncResult } from './firebaseAdmin';

const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';

const MAJOR_CITIES = [
  { name: 'Seoul', lat: 37.5665, lon: 126.9780 },
  { name: 'Tokyo', lat: 35.6762, lon: 139.6503 },
  { name: 'Beijing', lat: 39.9042, lon: 116.4074 },
  { name: 'New York', lat: 40.7128, lon: -74.0060 },
  { name: 'London', lat: 51.5074, lon: -0.1278 },
  { name: 'Paris', lat: 48.8566, lon: 2.3522 },
  { name: 'Sydney', lat: -33.8688, lon: 151.2093 },
  { name: 'Mumbai', lat: 19.0760, lon: 72.8777 },
];

interface WeatherReading {
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

interface FetchError {
  error: unknown;
  city: { name: string; lat: number; lon: number };
}

async function fetchWeatherForCity(
  city: { name: string; lat: number; lon: number },
  apiKey: string
): Promise<WeatherReading> {
  const url = `${WEATHER_API_URL}?lat=${city.lat}&lon=${city.lon}&appid=${apiKey}&units=metric`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`OpenWeather API returned ${response.status} for ${city.name}`);
  }
  const data = await response.json();
  return {
    city: city.name,
    latitude: city.lat,
    longitude: city.lon,
    temperature: data.main.temp,
    pressure: data.main.pressure,
    humidity: data.main.humidity,
    windSpeed: data.wind.speed,
    description: data.weather[0].description,
    timestamp: Date.now(),
  };
}

export async function runWeatherSync(): Promise<SyncResult> {
  const startTime = Date.now();

  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      throw new Error('OPENWEATHER_API_KEY environment variable is not set');
    }

    const weatherPromises = MAJOR_CITIES.map(city =>
      fetchWeatherForCity(city, apiKey).catch(error => {
        console.error(`Failed to fetch weather for ${city.name}:`, error);
        return { error, city } as FetchError;
      })
    );

    const results = await Promise.all(weatherPromises);

    let savedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (const result of results) {
      if ('error' in result) {
        const fetchErr = result as FetchError;
        failedCount++;
        errors.push(
          `${fetchErr.city.name}: ${fetchErr.error instanceof Error ? fetchErr.error.message : 'Unknown error'}`
        );
        continue;
      }

      try {
        if (db) {
          await db.collection('weather').add({
            ...result,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          savedCount++;
        }
      } catch (err) {
        failedCount++;
        const msg = err instanceof Error ? err.message : 'Unknown error';
        const reading = result as WeatherReading;
        errors.push(`${reading.city}: ${msg}`);
        console.error(`Failed to save weather for ${reading.city}:`, msg);
      }
    }

    if (db) {
      await db.collection('sync_logs').add({
        dataType: 'weather',
        status: failedCount === 0 ? 'success' : 'partial_success',
        recordsCount: savedCount,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        errorMessage: errors.length > 0 ? errors.join('; ') : undefined,
      });
    }

    console.log(`[Sync-Weather] Completed. Saved: ${savedCount}, Failed: ${failedCount}`);

    return {
      success: true,
      recordsProcessed: MAJOR_CITIES.length,
      recordsSaved: savedCount,
      recordsFailed: failedCount,
      errors: errors.length > 0 ? errors : undefined,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    console.error('[Sync-Weather] Sync failed:', error);

    if (db) {
      try {
        await db.collection('sync_logs').add({
          dataType: 'weather',
          status: 'failed',
          recordsCount: 0,
          timestamp: Date.now(),
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        });
      } catch (logError) {
        console.error('Failed to log sync failure:', logError);
      }
    }

    throw error;
  }
}
