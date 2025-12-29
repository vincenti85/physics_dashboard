import React, { useState } from 'react';

const Documentation: React.FC = () => {
  const [activeDoc, setActiveDoc] = useState<'earthquake' | 'weather' | 'radiation' | 'overview'>('overview');

  const renderOverview = () => (
    <div>
      <h2>시스템 개요</h2>
      <p>
        Physics Dashboard는 Google Maps와 Firebase를 활용하여 다양한 물리학 데이터를
        실시간으로 수집, 저장, 시각화하는 대시보드 시스템입니다.
      </p>

      <h3>주요 기능</h3>
      <ul>
        <li><strong>실시간 데이터 수집:</strong> USGS 지진 API, OpenWeather API 등 외부 API를 통한 데이터 수집</li>
        <li><strong>Firebase 클라우드 저장소:</strong> Firestore를 사용한 확장 가능한 NoSQL 데이터베이스</li>
        <li><strong>Google Maps 시각화:</strong> 지도 마커, 히트맵 등을 통한 직관적인 데이터 표시</li>
        <li><strong>자동 동기화:</strong> 매일 1회 자동으로 최신 데이터 동기화</li>
        <li><strong>수동 관리:</strong> API 테스트 및 수동 데이터 동기화 인터페이스</li>
      </ul>

      <h3>기술 스택</h3>
      <ul>
        <li>Frontend: React + TypeScript + Vite</li>
        <li>Maps: Google Maps JavaScript API</li>
        <li>Database: Firebase Firestore</li>
        <li>APIs: USGS Earthquake API, OpenWeather API</li>
      </ul>

      <h3>데이터베이스 컬렉션</h3>
      <ul>
        <li><code>earthquakes</code> - 지진 데이터</li>
        <li><code>weather</code> - 날씨 데이터</li>
        <li><code>radiation</code> - 방사능 측정 데이터</li>
        <li><code>sync_logs</code> - 데이터 동기화 로그</li>
      </ul>
    </div>
  );

  const renderEarthquakeDoc = () => (
    <div>
      <h2>지진 데이터베이스 (Earthquakes)</h2>

      <h3>개요</h3>
      <p>
        USGS(미국 지질조사국)에서 제공하는 실시간 지진 데이터를 수집하여 저장합니다.
        전 세계의 지진 활동을 모니터링하고 Google Maps 상에 표시합니다.
      </p>

      <h3>데이터 소스</h3>
      <ul>
        <li><strong>API:</strong> USGS Earthquake API</li>
        <li><strong>URL:</strong> https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson</li>
        <li><strong>업데이트 주기:</strong> 실시간 (동기화: 매일 1회)</li>
        <li><strong>데이터 범위:</strong> 최근 24시간 내 전 세계 지진</li>
      </ul>

      <h3>데이터베이스 스키마</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
        <thead>
          <tr style={{ background: '#f5f5f5' }}>
            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>필드명</th>
            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>타입</th>
            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>설명</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}><code>id</code></td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>string</td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>고유 식별자 (USGS 제공)</td>
          </tr>
          <tr>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}><code>magnitude</code></td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>number</td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>지진 규모 (리히터 척도)</td>
          </tr>
          <tr>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}><code>location</code></td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>string</td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>지진 발생 위치 설명</td>
          </tr>
          <tr>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}><code>latitude</code></td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>number</td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>위도</td>
          </tr>
          <tr>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}><code>longitude</code></td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>number</td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>경도</td>
          </tr>
          <tr>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}><code>depth</code></td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>number</td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>진원 깊이 (km)</td>
          </tr>
          <tr>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}><code>timestamp</code></td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>number</td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>발생 시간 (Unix timestamp)</td>
          </tr>
          <tr>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}><code>url</code></td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>string</td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>상세 정보 URL (선택)</td>
          </tr>
        </tbody>
      </table>

      <h3>접속 방법</h3>
      <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '4px', marginTop: '10px' }}>
        <h4>API를 통한 접속:</h4>
        <pre style={{ background: 'white', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
{`import { earthquakeAPI } from './services/earthquakeAPI';

// 최근 지진 데이터 가져오기
const earthquakes = await earthquakeAPI.fetchRecentEarthquakes();

// 특정 규모 이상 필터링
const majorEarthquakes = await earthquakeAPI.fetchEarthquakesByMagnitude(5.0);`}
        </pre>

        <h4 style={{ marginTop: '20px' }}>Firebase를 통한 직접 접속:</h4>
        <pre style={{ background: 'white', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
{`import { firebaseService } from './services/firebaseService';

// Firestore에서 지진 데이터 조회
const earthquakes = await firebaseService.getEarthquakes(100);

// 새로운 지진 데이터 추가
await firebaseService.addEarthquake({
  magnitude: 6.5,
  location: 'Japan',
  latitude: 35.6762,
  longitude: 139.6503,
  depth: 10.5,
  timestamp: Date.now()
});`}
        </pre>
      </div>

      <h3>수동 동기화</h3>
      <p>
        데이터 관리 페이지에서 "지진 데이터"를 선택하고 "수동 동기화" 버튼을 클릭하여
        즉시 최신 데이터를 가져올 수 있습니다.
      </p>
    </div>
  );

  const renderWeatherDoc = () => (
    <div>
      <h2>날씨 데이터베이스 (Weather)</h2>

      <h3>개요</h3>
      <p>
        OpenWeather API를 통해 전 세계 주요 도시의 실시간 날씨 데이터를 수집합니다.
        온도, 기압, 습도, 풍속 등의 물리적 기상 데이터를 모니터링합니다.
      </p>

      <h3>데이터 소스</h3>
      <ul>
        <li><strong>API:</strong> OpenWeather API</li>
        <li><strong>URL:</strong> https://api.openweathermap.org/data/2.5/weather</li>
        <li><strong>업데이트 주기:</strong> 실시간 (동기화: 매일 1회)</li>
        <li><strong>모니터링 도시:</strong> Seoul, Tokyo, Beijing, New York, London, Paris, Sydney, Mumbai</li>
      </ul>

      <h3>데이터베이스 스키마</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
        <thead>
          <tr style={{ background: '#f5f5f5' }}>
            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>필드명</th>
            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>타입</th>
            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>설명</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}><code>id</code></td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>string</td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>고유 식별자</td>
          </tr>
          <tr>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}><code>city</code></td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>string</td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>도시명</td>
          </tr>
          <tr>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}><code>latitude</code></td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>number</td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>위도</td>
          </tr>
          <tr>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}><code>longitude</code></td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>number</td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>경도</td>
          </tr>
          <tr>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}><code>temperature</code></td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>number</td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>온도 (°C)</td>
          </tr>
          <tr>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}><code>pressure</code></td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>number</td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>기압 (hPa)</td>
          </tr>
          <tr>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}><code>humidity</code></td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>number</td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>습도 (%)</td>
          </tr>
          <tr>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}><code>windSpeed</code></td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>number</td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>풍속 (m/s)</td>
          </tr>
          <tr>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}><code>description</code></td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>string</td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>날씨 설명</td>
          </tr>
          <tr>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}><code>timestamp</code></td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>number</td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>측정 시간 (Unix timestamp)</td>
          </tr>
        </tbody>
      </table>

      <h3>접속 방법</h3>
      <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '4px', marginTop: '10px' }}>
        <h4>API를 통한 접속:</h4>
        <pre style={{ background: 'white', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
{`import { weatherAPI } from './services/weatherAPI';

// 주요 도시 날씨 데이터 가져오기
const weatherData = await weatherAPI.fetchWeatherForMajorCities();

// 특정 좌표의 날씨 조회
const localWeather = await weatherAPI.fetchWeatherByCoordinates(37.5665, 126.9780);`}
        </pre>

        <h4 style={{ marginTop: '20px' }}>Firebase를 통한 직접 접속:</h4>
        <pre style={{ background: 'white', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
{`import { firebaseService } from './services/firebaseService';

// Firestore에서 날씨 데이터 조회
const weatherData = await firebaseService.getWeatherData(100);

// 새로운 날씨 데이터 추가
await firebaseService.addWeatherData({
  city: 'Seoul',
  latitude: 37.5665,
  longitude: 126.9780,
  temperature: 15.5,
  pressure: 1013,
  humidity: 65,
  windSpeed: 3.5,
  description: 'clear sky',
  timestamp: Date.now()
});`}
        </pre>
      </div>
    </div>
  );

  const renderRadiationDoc = () => (
    <div>
      <h2>방사능 데이터베이스 (Radiation)</h2>

      <h3>개요</h3>
      <p>
        전 세계 주요 지점의 방사능 수치를 모니터링합니다.
        현재는 시뮬레이션 데이터를 사용하며, 실제 API 연동 시 쉽게 교체 가능합니다.
      </p>

      <h3>데이터 소스</h3>
      <ul>
        <li><strong>현재:</strong> 시뮬레이션 데이터</li>
        <li><strong>업데이트 주기:</strong> 매일 1회</li>
        <li><strong>모니터링 지점:</strong> Fukushima, Chernobyl, Tokyo, Seoul, Paris, New York</li>
        <li><strong>단위:</strong> μSv/h (마이크로시버트/시간)</li>
      </ul>

      <h3>데이터베이스 스키마</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
        <thead>
          <tr style={{ background: '#f5f5f5' }}>
            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>필드명</th>
            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>타입</th>
            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>설명</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}><code>id</code></td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>string</td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>고유 식별자</td>
          </tr>
          <tr>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}><code>location</code></td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>string</td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>측정 위치</td>
          </tr>
          <tr>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}><code>latitude</code></td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>number</td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>위도</td>
          </tr>
          <tr>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}><code>longitude</code></td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>number</td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>경도</td>
          </tr>
          <tr>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}><code>value</code></td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>number</td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>방사능 수치</td>
          </tr>
          <tr>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}><code>unit</code></td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>string</td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>측정 단위 (μSv/h)</td>
          </tr>
          <tr>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}><code>timestamp</code></td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>number</td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>측정 시간 (Unix timestamp)</td>
          </tr>
          <tr>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}><code>source</code></td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>string</td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>데이터 출처</td>
          </tr>
        </tbody>
      </table>

      <h3>접속 방법</h3>
      <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '4px', marginTop: '10px' }}>
        <h4>API를 통한 접속:</h4>
        <pre style={{ background: 'white', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
{`import { radiationAPI } from './services/radiationAPI';

// 방사능 데이터 가져오기
const radiationData = await radiationAPI.fetchRadiationData();

// 특정 위치의 방사능 조회
const localRadiation = await radiationAPI.fetchRadiationByLocation(37.5665, 126.9780);`}
        </pre>

        <h4 style={{ marginTop: '20px' }}>Firebase를 통한 직접 접속:</h4>
        <pre style={{ background: 'white', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
{`import { firebaseService } from './services/firebaseService';

// Firestore에서 방사능 데이터 조회
const radiationData = await firebaseService.getRadiationData(100);

// 새로운 방사능 데이터 추가
await firebaseService.addRadiationData({
  location: 'Seoul, South Korea',
  latitude: 37.5665,
  longitude: 126.9780,
  value: 0.125,
  unit: 'μSv/h',
  timestamp: Date.now(),
  source: 'Monitoring Station'
});`}
        </pre>
      </div>

      <h3>참고 정보</h3>
      <ul>
        <li>일반 배경 방사선: 0.1 - 0.3 μSv/h</li>
        <li>항공기 탑승 시: 약 2 - 3 μSv/h</li>
        <li>의료 X-Ray: 약 100 μSv (1회)</li>
        <li>연간 자연 방사선 피폭: 약 2,400 μSv</li>
      </ul>
    </div>
  );

  return (
    <div style={{ padding: '20px' }}>
      <h1>데이터베이스 설명서</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        각 데이터베이스의 구조, 접속 방법, API 사용법에 대한 상세 설명
      </p>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveDoc('overview')}
          style={{
            padding: '10px 20px',
            background: activeDoc === 'overview' ? '#1976d2' : '#f5f5f5',
            color: activeDoc === 'overview' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          시스템 개요
        </button>
        <button
          onClick={() => setActiveDoc('earthquake')}
          style={{
            padding: '10px 20px',
            background: activeDoc === 'earthquake' ? '#d32f2f' : '#f5f5f5',
            color: activeDoc === 'earthquake' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          지진 DB
        </button>
        <button
          onClick={() => setActiveDoc('weather')}
          style={{
            padding: '10px 20px',
            background: activeDoc === 'weather' ? '#1976d2' : '#f5f5f5',
            color: activeDoc === 'weather' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          날씨 DB
        </button>
        <button
          onClick={() => setActiveDoc('radiation')}
          style={{
            padding: '10px 20px',
            background: activeDoc === 'radiation' ? '#f57c00' : '#f5f5f5',
            color: activeDoc === 'radiation' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          방사능 DB
        </button>
      </div>

      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        {activeDoc === 'overview' && renderOverview()}
        {activeDoc === 'earthquake' && renderEarthquakeDoc()}
        {activeDoc === 'weather' && renderWeatherDoc()}
        {activeDoc === 'radiation' && renderRadiationDoc()}
      </div>
    </div>
  );
};

export default Documentation;
