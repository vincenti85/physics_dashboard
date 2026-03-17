import React, { useEffect, useState } from 'react';
import { firebaseService } from '../services/firebaseService';
import { earthquakeAPI } from '../services/earthquakeAPI';
import { weatherAPI } from '../services/weatherAPI';
import { radiationAPI } from '../services/radiationAPI';
import { SyncLog } from '../types';

const DataManagement: React.FC = () => {
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [selectedAPI, setSelectedAPI] = useState<'earthquake' | 'weather' | 'radiation'>('earthquake');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  useEffect(() => {
    loadSyncLogs();
  }, []);

  const loadSyncLogs = async () => {
    try {
      const logs = await firebaseService.getSyncLogs(20);
      setSyncLogs(logs);
    } catch (error) {
      console.error('Error loading sync logs:', error);
    }
  };

  const testAPI = async () => {
    setLoading(true);
    setResult('');

    try {
      let data: any;
      if (selectedAPI === 'earthquake') {
        data = await earthquakeAPI.fetchRecentEarthquakes();
        setResult(`지진 데이터 ${data.length}개를 성공적으로 가져왔습니다.\n\n${JSON.stringify(data.slice(0, 3), null, 2)}`);
      } else if (selectedAPI === 'weather') {
        data = await weatherAPI.fetchWeatherForMajorCities();
        setResult(`날씨 데이터 ${data.length}개를 성공적으로 가져왔습니다.\n\n${JSON.stringify(data, null, 2)}`);
      } else if (selectedAPI === 'radiation') {
        data = await radiationAPI.fetchRadiationData();
        setResult(`방사능 데이터 ${data.length}개를 성공적으로 가져왔습니다.\n\n${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      setResult(`오류 발생: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  };

  const manualSync = async () => {
    setLoading(true);
    setResult('');

    try {
      let count = 0;
      if (selectedAPI === 'earthquake') {
        const data = await earthquakeAPI.fetchRecentEarthquakes();
        for (const item of data) {
          await firebaseService.addEarthquake(item);
          count++;
        }
        await firebaseService.addSyncLog({
          dataType: 'earthquake',
          status: 'success',
          recordsCount: count,
          timestamp: Date.now()
        });
      } else if (selectedAPI === 'weather') {
        const data = await weatherAPI.fetchWeatherForMajorCities();
        for (const item of data) {
          await firebaseService.addWeatherData(item);
          count++;
        }
        await firebaseService.addSyncLog({
          dataType: 'weather',
          status: 'success',
          recordsCount: count,
          timestamp: Date.now()
        });
      } else if (selectedAPI === 'radiation') {
        const data = await radiationAPI.fetchRadiationData();
        for (const item of data) {
          await firebaseService.addRadiationData(item);
          count++;
        }
        await firebaseService.addSyncLog({
          dataType: 'radiation',
          status: 'success',
          recordsCount: count,
          timestamp: Date.now()
        });
      }

      setResult(`${count}개의 ${selectedAPI} 레코드를 Firebase에 저장했습니다.`);
      await loadSyncLogs();
    } catch (error) {
      setResult(`동기화 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>데이터 관리</h1>
      <p style={{ color: '#666' }}>API 테스트 및 수동 데이터 동기화</p>

      <div style={{ marginTop: '30px', padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
        <h2>API/Manual 접속 인터페이스</h2>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
            데이터 소스 선택:
          </label>
          <select
            value={selectedAPI}
            onChange={(e) => setSelectedAPI(e.target.value as any)}
            style={{ padding: '10px', fontSize: '14px', width: '300px' }}
          >
            <option value="earthquake">지진 데이터 (USGS API)</option>
            <option value="weather">날씨 데이터 (OpenWeather API)</option>
            <option value="radiation">방사능 데이터 (Simulated)</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button
            onClick={testAPI}
            disabled={loading}
            style={{
              padding: '10px 20px',
              background: loading ? '#ccc' : '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'API 테스트 중...' : 'API 테스트'}
          </button>
          <button
            onClick={manualSync}
            disabled={loading}
            style={{
              padding: '10px 20px',
              background: loading ? '#ccc' : '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '동기화 중...' : '수동 동기화 (Firebase에 저장)'}
          </button>
        </div>

        {result && (
          <div style={{
            padding: '15px',
            background: 'white',
            borderRadius: '4px',
            border: '1px solid #ddd',
            maxHeight: '400px',
            overflow: 'auto'
          }}>
            <pre style={{ margin: 0, fontSize: '12px', whiteSpace: 'pre-wrap' }}>{result}</pre>
          </div>
        )}
      </div>

      <div style={{ marginTop: '30px' }}>
        <h2>동기화 로그</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>시간</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>데이터 타입</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>상태</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>레코드 수</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>오류 메시지</th>
              </tr>
            </thead>
            <tbody>
              {syncLogs.map((log) => (
                <tr key={log.id}>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                    {new Date(log.timestamp).toLocaleString('ko-KR')}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{log.dataType}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      background: log.status === 'success' ? '#d4edda' : '#f8d7da',
                      color: log.status === 'success' ? '#155724' : '#721c24',
                      fontSize: '12px'
                    }}>
                      {log.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{log.recordsCount}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee', color: '#d32f2f', fontSize: '12px' }}>
                    {log.errorMessage || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DataManagement;
