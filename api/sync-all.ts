import type { VercelRequest, VercelResponse } from '@vercel/node';

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

// Import sync functions
async function syncEarthquake() {
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'http://localhost:3000';
  
  const response = await fetch(`${baseUrl}/api/sync-earthquake`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.CRON_SECRET}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Earthquake sync failed: ${response.statusText}`);
  }

  return response.json();
}

async function syncWeather() {
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'http://localhost:3000';
  
  const response = await fetch(`${baseUrl}/api/sync-weather`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.CRON_SECRET}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Weather sync failed: ${response.statusText}`);
  }

  return response.json();
}

async function syncRadiation() {
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'http://localhost:3000';
  
  const response = await fetch(`${baseUrl}/api/sync-radiation`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.CRON_SECRET}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Radiation sync failed: ${response.statusText}`);
  }

  return response.json();
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
    console.log('[Sync-All] Starting full data sync...');
    const startTime = Date.now();

    // Run all syncs in parallel
    const results = await Promise.allSettled([
      syncEarthquake(),
      syncWeather(),
      syncRadiation()
    ]);

    const earthquake = results[0].status === 'fulfilled' ? results[0].value : { success: false, error: results[0].reason };
    const weather = results[1].status === 'fulfilled' ? results[1].value : { success: false, error: results[1].reason };
    const radiation = results[2].status === 'fulfilled' ? results[2].value : { success: false, error: results[2].reason };

    const totalRecords = 
      (earthquake.recordsSaved || 0) +
      (weather.recordsSaved || 0) +
      (radiation.recordsSaved || 0);

    const totalFailed = 
      (earthquake.recordsFailed || 0) +
      (weather.recordsFailed || 0) +
      (radiation.recordsFailed || 0);

    const overallSuccess = earthquake.success && weather.success && radiation.success;

    // Log overall sync
    if (db) {
      await db.collection('sync_logs').add({
        dataType: 'all',
        status: overallSuccess ? 'success' : 'partial_success',
        recordsCount: totalRecords,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        details: {
          earthquake: earthquake.success ? 'success' : 'failed',
          weather: weather.success ? 'success' : 'failed',
          radiation: radiation.success ? 'success' : 'failed'
        }
      });
    }

    console.log(`[Sync-All] Completed. Total Saved: ${totalRecords}, Total Failed: ${totalFailed}`);

    return res.status(200).json({
      success: overallSuccess,
      message: overallSuccess ? 'All data synced successfully' : 'Some syncs failed',
      duration: Date.now() - startTime,
      results: {
        earthquake,
        weather,
        radiation
      },
      summary: {
        totalRecordsSaved: totalRecords,
        totalRecordsFailed: totalFailed
      }
    });

  } catch (error) {
    console.error('[Sync-All] Sync failed:', error);

    if (db) {
      try {
        await db.collection('sync_logs').add({
          dataType: 'all',
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
