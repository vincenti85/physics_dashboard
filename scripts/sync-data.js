import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';
import axios from 'axios';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function syncEarthquakes() {
  console.log('Syncing earthquake data...');
  try {
    const response = await axios.get(process.env.VITE_USGS_EARTHQUAKE_API);
    const features = response.data.features;

    for (const feature of features) {
      await addDoc(collection(db, 'earthquakes'), {
        magnitude: feature.properties.mag,
        location: feature.properties.place,
        latitude: feature.geometry.coordinates[1],
        longitude: feature.geometry.coordinates[0],
        depth: feature.geometry.coordinates[2],
        timestamp: feature.properties.time,
        url: feature.properties.url,
        createdAt: Timestamp.now()
      });
    }

    console.log(`Synced ${features.length} earthquake records`);
    return features.length;
  } catch (error) {
    console.error('Earthquake sync failed:', error);
    return 0;
  }
}

async function syncWeather() {
  console.log('Syncing weather data...');
  const cities = [
    { name: 'Seoul', lat: 37.5665, lon: 126.9780 },
    { name: 'Tokyo', lat: 35.6762, lon: 139.6503 },
    { name: 'Beijing', lat: 39.9042, lon: 116.4074 },
    { name: 'New York', lat: 40.7128, lon: -74.0060 }
  ];

  let count = 0;
  for (const city of cities) {
    try {
      const response = await axios.get(process.env.VITE_OPENWEATHER_API_URL, {
        params: {
          lat: city.lat,
          lon: city.lon,
          appid: process.env.VITE_OPENWEATHER_API_KEY,
          units: 'metric'
        }
      });

      await addDoc(collection(db, 'weather'), {
        city: city.name,
        latitude: city.lat,
        longitude: city.lon,
        temperature: response.data.main.temp,
        pressure: response.data.main.pressure,
        humidity: response.data.main.humidity,
        windSpeed: response.data.wind.speed,
        description: response.data.weather[0].description,
        timestamp: Date.now(),
        createdAt: Timestamp.now()
      });
      count++;
    } catch (error) {
      console.error(`Weather sync failed for ${city.name}:`, error);
    }
  }

  console.log(`Synced ${count} weather records`);
  return count;
}

async function main() {
  console.log('Starting daily data sync...');
  const earthquakeCount = await syncEarthquakes();
  const weatherCount = await syncWeather();

  await addDoc(collection(db, 'sync_logs'), {
    earthquakeCount,
    weatherCount,
    timestamp: Date.now(),
    createdAt: Timestamp.now()
  });

  console.log('Daily sync completed successfully');
  process.exit(0);
}

main().catch(error => {
  console.error('Sync failed:', error);
  process.exit(1);
});
