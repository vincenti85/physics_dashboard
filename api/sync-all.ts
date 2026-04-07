import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from './_lib/firebaseAdmin';
import { runEarthquakeSync } from './_lib/syncEarthquake';
import { runWeatherSync } from './_lib/syncWeather';
import { runRadiationSync } from './_lib/syncRadiation';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'Only POST requests are supported',
    });
  }

  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or missing authorization header',
    });
  }

  try {
    console.log('[Sync-All] Starting full data sync...');
    const startTime = Date.now();

    // Run all syncs in parallel, calling lib functions directly (no HTTP overhead)
    const [earthquakeResult, weatherResult, radiationResult] = await Promise.allSettled([
      runEarthquakeSync(),
      runWeatherSync(),
      runRadiationSync(),
    ]);

    const earthquake =
      earthquakeResult.status === 'fulfilled'
        ? earthquakeResult.value
        : { success: false, recordsSaved: 0, recordsFailed: 0, error: earthquakeResult.reason };

    const weather =
      weatherResult.status === 'fulfilled'
        ? weatherResult.value
        : { success: false, recordsSaved: 0, recordsFailed: 0, error: weatherResult.reason };

    const radiation =
      radiationResult.status === 'fulfilled'
        ? radiationResult.value
        : { success: false, recordsSaved: 0, recordsFailed: 0, error: radiationResult.reason };

    const totalRecords =
      (earthquake.recordsSaved || 0) +
      (weather.recordsSaved || 0) +
      (radiation.recordsSaved || 0);

    const totalFailed =
      (earthquake.recordsFailed || 0) +
      (weather.recordsFailed || 0) +
      (radiation.recordsFailed || 0);

    const overallSuccess = earthquake.success && weather.success && radiation.success;
    const duration = Date.now() - startTime;

    if (db) {
      await db.collection('sync_logs').add({
        dataType: 'all',
        status: overallSuccess ? 'success' : 'partial_success',
        recordsCount: totalRecords,
        timestamp: Date.now(),
        duration,
        details: {
          earthquake: earthquake.success ? 'success' : 'failed',
          weather: weather.success ? 'success' : 'failed',
          radiation: radiation.success ? 'success' : 'failed',
        },
      });
    }

    console.log(`[Sync-All] Completed. Total Saved: ${totalRecords}, Total Failed: ${totalFailed}`);

    return res.status(200).json({
      success: overallSuccess,
      message: overallSuccess ? 'All data synced successfully' : 'Some syncs failed',
      duration,
      results: { earthquake, weather, radiation },
      summary: {
        totalRecordsSaved: totalRecords,
        totalRecordsFailed: totalFailed,
      },
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
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        });
      } catch (logError) {
        console.error('Failed to log error:', logError);
      }
    }

    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    });
  }
}
