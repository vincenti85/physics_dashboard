import type { VercelRequest, VercelResponse } from '@vercel/node';

interface EarthquakeData {
  id: string;
  magnitude: number;
  location: string;
  latitude: number;
  longitude: number;
  depth: number;
  timestamp: number;
  url?: string;
}

const USGS_API_URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson';

// Firebase Admin SDK (server-side)
let admin: any;
try {
  admin = require('firebase-admin');
  
  // Initialize Firebase Admin
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only POST requests are supported'
    });
  }

  // Verify cron secret for security
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Invalid or missing authorization header'
    });
  }

  try {
    console.log('[Sync-Earthquake] Starting earthquake data sync...');
    const startTime = Date.now();

    // Fetch data from USGS API
    const response = await fetch(USGS_API_URL);
    if (!response.ok) {
      throw new Error(`USGS API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const features = data.features || [];

    if (features.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No earthquake data available',
        recordsProcessed: 0,
        recordsSaved: 0,
        duration: Date.now() - startTime
      });
    }

    // Transform and save to Firebase
    let savedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (const feature of features) {
      try {
        const earthquakeData: Omit<EarthquakeData, 'id'> = {
          magnitude: feature.properties.mag,
          location: feature.properties.place,
          latitude: feature.geometry.coordinates[1],
          longitude: feature.geometry.coordinates[0],
          depth: feature.geometry.coordinates[2],
          timestamp: feature.properties.time,
          url: feature.properties.url
        };

        // Save to Firestore
        if (db) {
          await db.collection('earthquakes').add({
            ...earthquakeData,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          });
          savedCount++;
        } else {
          errors.push('Firebase not initialized');
          failedCount++;
        }
      } catch (error) {
        failedCount++;
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Feature ${feature.id}: ${errorMsg}`);
        console.error(`Failed to save earthquake ${feature.id}:`, errorMsg);
      }
    }

    // Log sync completion
    if (db) {
      await db.collection('sync_logs').add({
        dataType: 'earthquake',
        status: failedCount === 0 ? 'success' : 'partial_success',
        recordsCount: savedCount,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        errorMessage: errors.length > 0 ? errors.join('; ') : undefined
      });
    }

    console.log(`[Sync-Earthquake] Completed. Saved: ${savedCount}, Failed: ${failedCount}`);

    return res.status(200).json({
      success: true,
      message: `Earthquake sync completed`,
      recordsProcessed: features.length,
      recordsSaved: savedCount,
      recordsFailed: failedCount,
      errors: errors.length > 0 ? errors.slice(0, 5) : undefined,
      duration: Date.now() - startTime
    });

  } catch (error) {
    console.error('[Sync-Earthquake] Sync failed:', error);

    // Log failure to Firebase
    if (db) {
      try {
        await db.collection('sync_logs').add({
          dataType: 'earthquake',
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
