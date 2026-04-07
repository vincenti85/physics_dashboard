import { admin, db, SyncResult } from './firebaseAdmin';

const RADIATION_SITES = [
  { location: 'Fukushima, Japan', lat: 37.4213, lon: 141.0327 },
  { location: 'Chernobyl, Ukraine', lat: 51.3892, lon: 30.0993 },
  { location: 'Tokyo, Japan', lat: 35.6762, lon: 139.6503 },
  { location: 'Seoul, South Korea', lat: 37.5665, lon: 126.9780 },
  { location: 'Paris, France', lat: 48.8566, lon: 2.3522 },
  { location: 'New York, USA', lat: 40.7128, lon: -74.0060 },
];

interface RadiationReading {
  location: string;
  latitude: number;
  longitude: number;
  value: number;
  unit: string;
  timestamp: number;
  source: string;
}

function generateRadiationReading(
  site: { location: string; lat: number; lon: number }
): RadiationReading {
  // Base radiation values (μSv/h)
  const baseValue = site.location.includes('Fukushima')
    ? 0.5
    : site.location.includes('Chernobyl')
    ? 0.3
    : 0.1; // Normal background radiation

  // Add random variation ±0.025 μSv/h
  const randomVariation = (Math.random() - 0.5) * 0.05;
  const value = Math.max(0, baseValue + randomVariation);

  return {
    location: site.location,
    latitude: site.lat,
    longitude: site.lon,
    value: parseFloat(value.toFixed(3)),
    unit: 'μSv/h',
    timestamp: Date.now(),
    source: 'Simulated Data',
  };
}

export interface RadiationSyncResult extends SyncResult {
  data: RadiationReading[];
}

export async function runRadiationSync(): Promise<RadiationSyncResult> {
  const startTime = Date.now();

  try {
    let savedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];
    const saved: RadiationReading[] = [];

    for (const site of RADIATION_SITES) {
      try {
        const reading = generateRadiationReading(site);

        if (db) {
          await db.collection('radiation').add({
            ...reading,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          saved.push(reading);
          savedCount++;
        } else {
          errors.push('Firebase not initialized');
          failedCount++;
        }
      } catch (err) {
        failedCount++;
        const msg = err instanceof Error ? err.message : 'Unknown error';
        errors.push(`${site.location}: ${msg}`);
        console.error(`Failed to save radiation data for ${site.location}:`, msg);
      }
    }

    if (db) {
      await db.collection('sync_logs').add({
        dataType: 'radiation',
        status: failedCount === 0 ? 'success' : 'partial_success',
        recordsCount: savedCount,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        errorMessage: errors.length > 0 ? errors.join('; ') : undefined,
      });
    }

    console.log(`[Sync-Radiation] Completed. Saved: ${savedCount}, Failed: ${failedCount}`);

    return {
      success: true,
      recordsProcessed: RADIATION_SITES.length,
      recordsSaved: savedCount,
      recordsFailed: failedCount,
      errors: errors.length > 0 ? errors : undefined,
      duration: Date.now() - startTime,
      data: saved,
    };
  } catch (error) {
    console.error('[Sync-Radiation] Sync failed:', error);

    if (db) {
      try {
        await db.collection('sync_logs').add({
          dataType: 'radiation',
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
