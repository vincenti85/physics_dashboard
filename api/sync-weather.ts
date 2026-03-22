import type { VercelRequest, VercelResponse } from '@vercel/node';

interface WeatherData {
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

const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

const MAJOR_CITIES = [
  { name: 'Seoul', lat: 37.5665, lon: 126.9780 },
  { name: 'Tokyo', lat: 35.6762, lon: 139.6503 },
  { name: 'Beijing', lat: 39.9042, lon: 116.4074 },
  { name: 'New York', lat: 40.7128, lon: -74.0060 },
  { name: 'London', lat: 51.5074, lon: -0.1278 },
  { name: 'Paris', lat: 48.8566, lon: 2.3522 },
  { name: 'Sydney', lat: -33.8688, lon: 151.2093 },
  { name: 'Mumbai', lat: 19.0760, lon: 72.8777 }
];

// Firebase Admin SDK
let admin: any;
try {
  admin = require('firebase-admin');
  
  if (!admin.apps.length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID
    });
  }
} catch (error) {
  console.error('Firebase Admin initialization failed:', error);
}

const db = admin?.firestore();

async function fetchWeatherForCity(city: { name: string; lat: number; lon: number }): Promise<WeatherData> {
  const url = `${WEATHER_API_URL}?lat=${city.lat}&lon=${city.lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`OpenWeather API returned ${response.status} for ${city.name}`);
  }

  const data = await response.json();

  return {
    id: `${city.name}-${Date.now()}`,
    city: city.name,
    latitude: city.lat,
    longitude: city.lon,
    temperature: data.main.temp,
    pressure: data.main.pressure,
    humidity: data.main.humidity,
    windSpeed: data.wind.speed,
    description: data.weather[0].description,
    timestamp: Date.now()
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only POST requests are supported'
    });
  }

  // Verify cron secret
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Invalid or missing authorization header'
    });
  }

  try {
    console.log('[Sync-Weather] Starting weather data sync...');
    const startTime = Date.now();

    if (!OPENWEATHER_API_KEY) {
      throw new Error('OPENWEATHER_API_KEY environment variable is not set');
    }

    // Fetch weather for all cities in parallel
    const weatherPromises = MAJOR_CITIES.map(city => 
      fetchWeatherForCity(city).catch(error => {
        console.error(`Failed to fetch weather for ${city.name}:`, error);
        return { error, city };
      })
    );

    const results = await Promise.all(weatherPromises);

    let savedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    // Save to Firebase
    for (const result of results) {
      if ('error' in result) {
        failedCount++;
        errors.push(`${result.city.name}: ${result.error instanceof Error ? result.error.message : 'Unknown error'}`);
        continue;
      }

      try {
        if (db) {
          const { id, ...weatherData } = result as WeatherData;
          await db.collection('weather').add({
            ...weatherData,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          });
          savedCount++;
        }
      } catch (error) {
        failedCount++;
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`${result.city}: ${errorMsg}`);
        console.error(`Failed to save weather for ${result.city}:`, errorMsg);
      }
    }

    // Log sync completion
    if (db) {
      await db.collection('sync_logs').add({
        dataType: 'weather',
        status: failedCount === 0 ? 'success' : 'partial_success',
        recordsCount: savedCount,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        errorMessage: errors.length > 0 ? errors.join('; ') : undefined
      });
    }

    console.log(`[Sync-Weather] Completed. Saved: ${savedCount}, Failed: ${failedCount}`);

    return res.status(200).json({
      success: true,
      message: 'Weather sync completed',
      recordsProcessed: MAJOR_CITIES.length,
      recordsSaved: savedCount,
      recordsFailed: failedCount,
      errors: errors.length > 0 ? errors : undefined,
      duration: Date.now() - startTime
    });

  } catch (error) {
    console.error('[Sync-Weather] Sync failed:', error);

    if (db) {
      try {
        await db.collection('sync_logs').add({
          dataType: 'weather',
          status: 'failed',
          recordsCount: 0,
          timestamp: Date.now(),
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        });
      } catch (logError) {
        console.error('Failed to log error:', logError);
      }
    }

    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}
