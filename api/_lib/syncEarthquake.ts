import { admin, db, SyncResult } from './firebaseAdmin';

const USGS_API_URL =
  'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson';

export async function runEarthquakeSync(): Promise<SyncResult> {
  const startTime = Date.now();

  try {
    const response = await fetch(USGS_API_URL);
    if (!response.ok) {
      throw new Error(`USGS API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const features: any[] = data.features || [];

    if (features.length === 0) {
      return { success: true, recordsProcessed: 0, recordsSaved: 0, recordsFailed: 0, duration: Date.now() - startTime };
    }

    let savedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (const feature of features) {
      try {
        // USGS API allows null for mag and place (events under review)
        if (feature.properties.mag == null || feature.properties.place == null) {
          failedCount++;
          errors.push(`Feature ${feature.id}: missing required fields (mag or place is null)`);
          continue;
        }
        if (
          !Array.isArray(feature.geometry?.coordinates) ||
          feature.geometry.coordinates.length < 3
        ) {
          failedCount++;
          errors.push(`Feature ${feature.id}: missing or invalid geometry coordinates`);
          continue;
        }

        const earthquakeData = {
          magnitude: feature.properties.mag,
          location: feature.properties.place,
          latitude: feature.geometry.coordinates[1],
          longitude: feature.geometry.coordinates[0],
          depth: feature.geometry.coordinates[2],
          timestamp: feature.properties.time,
          url: feature.properties.url,
        };

        if (db) {
          await db.collection('earthquakes').add({
            ...earthquakeData,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          savedCount++;
        } else {
          errors.push('Firebase not initialized');
          failedCount++;
        }
      } catch (err) {
        failedCount++;
        const msg = err instanceof Error ? err.message : 'Unknown error';
        errors.push(`Feature ${feature.id}: ${msg}`);
        console.error(`Failed to save earthquake ${feature.id}:`, msg);
      }
    }

    if (db) {
      await db.collection('sync_logs').add({
        dataType: 'earthquake',
        status: failedCount === 0 ? 'success' : 'partial_success',
        recordsCount: savedCount,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        errorMessage: errors.length > 0 ? errors.join('; ') : undefined,
      });
    }

    console.log(`[Sync-Earthquake] Completed. Saved: ${savedCount}, Failed: ${failedCount}`);

    return {
      success: true,
      recordsProcessed: features.length,
      recordsSaved: savedCount,
      recordsFailed: failedCount,
      errors: errors.length > 0 ? errors.slice(0, 5) : undefined,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    console.error('[Sync-Earthquake] Sync failed:', error);

    if (db) {
      try {
        await db.collection('sync_logs').add({
          dataType: 'earthquake',
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
