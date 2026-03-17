import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { EarthquakeData, WeatherData, RadiationData, SyncLog } from '../types';

const COLLECTIONS = {
  EARTHQUAKES: 'earthquakes',
  WEATHER: 'weather',
  RADIATION: 'radiation',
  SYNC_LOGS: 'sync_logs'
};

export class FirebaseService {

  async addEarthquake(data: Omit<EarthquakeData, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.EARTHQUAKES), {
      ...data,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  }

  async getEarthquakes(limitCount: number = 100): Promise<EarthquakeData[]> {
    const q = query(
      collection(db, COLLECTIONS.EARTHQUAKES),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EarthquakeData));
  }

  async addWeatherData(data: Omit<WeatherData, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.WEATHER), {
      ...data,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  }

  async getWeatherData(limitCount: number = 100): Promise<WeatherData[]> {
    const q = query(
      collection(db, COLLECTIONS.WEATHER),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WeatherData));
  }

  async addRadiationData(data: Omit<RadiationData, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.RADIATION), {
      ...data,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  }

  async getRadiationData(limitCount: number = 100): Promise<RadiationData[]> {
    const q = query(
      collection(db, COLLECTIONS.RADIATION),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RadiationData));
  }

  async addSyncLog(log: Omit<SyncLog, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.SYNC_LOGS), {
      ...log,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  }

  async getSyncLogs(limitCount: number = 50): Promise<SyncLog[]> {
    const q = query(
      collection(db, COLLECTIONS.SYNC_LOGS),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SyncLog));
  }

  async getRecentSyncLogs(dataType: string, hours: number = 24): Promise<SyncLog[]> {
    const cutoffTime = Date.now() - (hours * 60 * 60 * 1000);
    const q = query(
      collection(db, COLLECTIONS.SYNC_LOGS),
      where('dataType', '==', dataType),
      where('timestamp', '>=', cutoffTime),
      orderBy('timestamp', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SyncLog));
  }
}

export const firebaseService = new FirebaseService();
