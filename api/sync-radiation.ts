import type { VercelRequest, VercelResponse } from '@vercel/node';

interface RadiationData {
  id: string;
  location: string;
  latitude: number;
  longitude: number;
  value: number;
  unit: string;
  timestamp: number;
  source: string;
}

// Simulated radiation monitoring sites
const RADIATION_SITES = [
  { location: 'Fukushima, Japan', lat: 37.4213, lon: 141.0327 },
  { location: 'Chernobyl, Ukraine', lat: 51.3892, lon: 30.0993 },
  { location: 'Tokyo, Japan', lat: 35.6762, lon: 139.6503 },
  { location: 'Seoul, South Korea', lat: 37.5665, lon: 126.9780 },
  { location: 'Paris, France', lat: 48.8566, lon: 2.3522 },
  { location: 'New York, USA', lat: 40.7128, lon: -74.0060 }
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

function generateRadiationData(site: { location: string; lat: number; lon: number }): RadiationData {
  // Base radiation values (μSv/h)
  const baseValue = site.location.includes('Fukushima') ? 0.5 :
                   site.location.includes('Chernobyl') ? 0.3 :
                   0.1; // Normal background radiation

  // Add random variation ±0.025 μSv/h
  const randomVariation = (Math.random() - 0.5) * 0.05;
  const value = Math.max(0, baseValue + randomVariation);

  return {
    id: `rad-${site.location.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}`,
    location: site.location,
    latitude: site.lat,
    longitude: site.lon,
    value: parseFloat(value.toFixed(3)),
    unit: 'μSv/h',
    timestamp: Date.now(),
    source: 'Simulated Data'
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
    console.log('[Sync-Radiation] Starting radiation data sync...');
    const startTime = Date.now();

    let savedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];
    const radiationData: RadiationData[] = [];

    // Generate radiation data for all sites
    for (const site of RADIATION_SITES) {
      try {
        const data = generateRadiationData(site);
        radiationData.push(data);

        // Save to Firebase
        if (db) {
          const { id, ...radiationDoc } = data;
          await db.collection('radiation').add({
            ...radiationDoc,
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
        errors.push(`${site.location}: ${errorMsg}`);
        console.error(`Failed to save radiation data for ${site.location}:`, errorMsg);
      }
    }

    // Log sync completion
    if (db) {
      await db.collection('sync_logs').add({
        dataType: 'radiation',
        status: failedCount === 0 ? 'success' : 'partial_success',
        recordsCount: savedCount,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        errorMessage: errors.length > 0 ? errors.join('; ') : undefined
      });
    }

    console.log(`[Sync-Radiation] Completed. Saved: ${savedCount}, Failed: ${failedCount}`);

    return res.status(200).json({
      success: true,
      message: 'Radiation sync completed',
      recordsProcessed: RADIATION_SITES.length,
      recordsSaved: savedCount,
      recordsFailed: failedCount,
      data: radiationData,
      errors: errors.length > 0 ? errors : undefined,
      duration: Date.now() - startTime
    });

  } catch (error) {
    console.error('[Sync-Radiation] Sync failed:', error);

    if (db) {
      try {
        await db.collection('sync_logs').add({
          dataType: 'radiation',
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
