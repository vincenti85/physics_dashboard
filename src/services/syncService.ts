import { earthquakeAPI } from './earthquakeAPI';
import { weatherAPI } from './weatherAPI';
import { radiationAPI } from './radiationAPI';
import { firebaseService } from './firebaseService';

export class SyncService {
  async syncEarthquakeData(): Promise<void> {
    console.log('Starting earthquake data sync...');
    try {
      const earthquakes = await earthquakeAPI.fetchRecentEarthquakes();

      let successCount = 0;
      for (const eq of earthquakes) {
        try {
          await firebaseService.addEarthquake(eq);
          successCount++;
        } catch (error) {
          console.error(`Failed to save earthquake ${eq.id}:`, error);
        }
      }

      await firebaseService.addSyncLog({
        dataType: 'earthquake',
        status: 'success',
        recordsCount: successCount,
        timestamp: Date.now()
      });

      console.log(`Synced ${successCount} earthquake records`);
    } catch (error) {
      console.error('Earthquake sync failed:', error);
      await firebaseService.addSyncLog({
        dataType: 'earthquake',
        status: 'failed',
        recordsCount: 0,
        timestamp: Date.now(),
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async syncWeatherData(): Promise<void> {
    console.log('Starting weather data sync...');
    try {
      const weatherData = await weatherAPI.fetchWeatherForMajorCities();

      let successCount = 0;
      for (const weather of weatherData) {
        try {
          await firebaseService.addWeatherData(weather);
          successCount++;
        } catch (error) {
          console.error(`Failed to save weather data for ${weather.city}:`, error);
        }
      }

      await firebaseService.addSyncLog({
        dataType: 'weather',
        status: 'success',
        recordsCount: successCount,
        timestamp: Date.now()
      });

      console.log(`Synced ${successCount} weather records`);
    } catch (error) {
      console.error('Weather sync failed:', error);
      await firebaseService.addSyncLog({
        dataType: 'weather',
        status: 'failed',
        recordsCount: 0,
        timestamp: Date.now(),
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async syncRadiationData(): Promise<void> {
    console.log('Starting radiation data sync...');
    try {
      const radiationData = await radiationAPI.fetchRadiationData();

      let successCount = 0;
      for (const radiation of radiationData) {
        try {
          await firebaseService.addRadiationData(radiation);
          successCount++;
        } catch (error) {
          console.error(`Failed to save radiation data for ${radiation.location}:`, error);
        }
      }

      await firebaseService.addSyncLog({
        dataType: 'radiation',
        status: 'success',
        recordsCount: successCount,
        timestamp: Date.now()
      });

      console.log(`Synced ${successCount} radiation records`);
    } catch (error) {
      console.error('Radiation sync failed:', error);
      await firebaseService.addSyncLog({
        dataType: 'radiation',
        status: 'failed',
        recordsCount: 0,
        timestamp: Date.now(),
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async syncAllData(): Promise<void> {
    console.log('Starting full data sync...');
    await Promise.all([
      this.syncEarthquakeData(),
      this.syncWeatherData(),
      this.syncRadiationData()
    ]);
    console.log('Full data sync completed');
  }
}

export const syncService = new SyncService();
