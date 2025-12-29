import React, { useEffect, useState } from 'react';
import GoogleMap from '../components/GoogleMap';
import HeatMap from '../components/HeatMap';
import { firebaseService } from '../services/firebaseService';
import { syncService } from '../services/syncService';
import { EarthquakeData, WeatherData, RadiationData, MapMarker } from '../types';

const Dashboard: React.FC = () => {
  const [earthquakes, setEarthquakes] = useState<EarthquakeData[]>([]);
  const [weather, setWeather] = useState<WeatherData[]>([]);
  const [radiation, setRadiation] = useState<RadiationData[]>([]);
  const [mapMarkers, setMapMarkers] = useState<MapMarker[]>([]);
  const [activeView, setActiveView] = useState<'all' | 'earthquake' | 'weather' | 'radiation' | 'heatmap'>('all');
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [autoSync, setAutoSync] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    updateMapMarkers();
  }, [earthquakes, weather, radiation, activeView]);

  // Auto-sync feature - runs every 24 hours when enabled
  useEffect(() => {
    if (!autoSync) return;

    const syncInterval = setInterval(() => {
      handleSync();
    }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds

    return () => clearInterval(syncInterval);
  }, [autoSync]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [eqData, weatherData, radData] = await Promise.all([
        firebaseService.getEarthquakes(50),
        firebaseService.getWeatherData(20),
        firebaseService.getRadiationData(20)
      ]);

      setEarthquakes(eqData);
      setWeather(weatherData);
      setRadiation(radData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateMapMarkers = () => {
    const markers: MapMarker[] = [];

    if (activeView === 'all' || activeView === 'earthquake') {
      earthquakes.forEach(eq => {
        markers.push({
          id: eq.id,
          position: { lat: eq.latitude, lng: eq.longitude },
          title: `지진 - M${eq.magnitude} - ${eq.location}`,
          type: 'earthquake',
          data: eq
        });
      });
    }

    if (activeView === 'all' || activeView === 'weather') {
      weather.forEach(w => {
        markers.push({
          id: w.id,
          position: { lat: w.latitude, lng: w.longitude },
          title: `날씨 - ${w.city} - ${w.temperature}°C`,
          type: 'weather',
          data: w
        });
      });
    }

    if (activeView === 'all' || activeView === 'radiation') {
      radiation.forEach(r => {
        markers.push({
          id: r.id,
          position: { lat: r.latitude, lng: r.longitude },
          title: `방사능 - ${r.location} - ${r.value} ${r.unit}`,
          type: 'radiation',
          data: r
        });
      });
    }

    setMapMarkers(markers);
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncService.syncAllData();
      await loadData();
      setLastSyncTime(new Date());
      alert('데이터 동기화가 완료되었습니다!');
    } catch (error) {
      console.error('Sync error:', error);
      alert('데이터 동기화 중 오류가 발생했습니다.');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ margin: '0 0 10px 0' }}>Physics Dashboard</h1>
        <p style={{ margin: 0, color: '#666' }}>
          실시간 물리학 데이터 모니터링 시스템 - Google Maps & Firebase
        </p>
        {lastSyncTime && (
          <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#999' }}>
            마지막 동기화: {lastSyncTime.toLocaleString('ko-KR')}
          </p>
        )}
      </div>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          onClick={() => setActiveView('all')}
          style={{
            padding: '10px 20px',
            background: activeView === 'all' ? '#1976d2' : '#f5f5f5',
            color: activeView === 'all' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          전체 보기
        </button>
        <button
          onClick={() => setActiveView('earthquake')}
          style={{
            padding: '10px 20px',
            background: activeView === 'earthquake' ? '#d32f2f' : '#f5f5f5',
            color: activeView === 'earthquake' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          지진 데이터
        </button>
        <button
          onClick={() => setActiveView('weather')}
          style={{
            padding: '10px 20px',
            background: activeView === 'weather' ? '#1976d2' : '#f5f5f5',
            color: activeView === 'weather' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          날씨 데이터
        </button>
        <button
          onClick={() => setActiveView('radiation')}
          style={{
            padding: '10px 20px',
            background: activeView === 'radiation' ? '#f57c00' : '#f5f5f5',
            color: activeView === 'radiation' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          방사능 데이터
        </button>
        <button
          onClick={() => setActiveView('heatmap')}
          style={{
            padding: '10px 20px',
            background: activeView === 'heatmap' ? '#7b1fa2' : '#f5f5f5',
            color: activeView === 'heatmap' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          히트맵
        </button>
        <button
          onClick={handleSync}
          disabled={syncing}
          style={{
            padding: '10px 20px',
            background: syncing ? '#ccc' : '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: syncing ? 'not-allowed' : 'pointer',
            marginLeft: 'auto'
          }}
        >
          {syncing ? '동기화 중...' : '데이터 동기화'}
        </button>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={autoSync}
            onChange={(e) => setAutoSync(e.target.checked)}
            style={{ cursor: 'pointer' }}
          />
          <span style={{ fontSize: '14px' }}>자동 동기화 (24시간마다)</span>
        </label>
      </div>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1, padding: '15px', background: '#ffebee', borderRadius: '8px' }}>
          <h3 style={{ margin: '0 0 5px 0', color: '#d32f2f' }}>지진 데이터</h3>
          <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>{earthquakes.length}</p>
          <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#666' }}>개의 기록</p>
        </div>
        <div style={{ flex: 1, padding: '15px', background: '#e3f2fd', borderRadius: '8px' }}>
          <h3 style={{ margin: '0 0 5px 0', color: '#1976d2' }}>날씨 데이터</h3>
          <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>{weather.length}</p>
          <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#666' }}>개의 기록</p>
        </div>
        <div style={{ flex: 1, padding: '15px', background: '#fff3e0', borderRadius: '8px' }}>
          <h3 style={{ margin: '0 0 5px 0', color: '#f57c00' }}>방사능 데이터</h3>
          <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>{radiation.length}</p>
          <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#666' }}>개의 기록</p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>데이터를 불러오는 중...</p>
        </div>
      ) : (
        <>
          {activeView === 'heatmap' ? (
            <HeatMap earthquakes={earthquakes} />
          ) : (
            <GoogleMap markers={mapMarkers} />
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
