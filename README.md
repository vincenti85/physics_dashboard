# Physics Dashboard

Google Maps와 Firebase를 활용한 실시간 물리학 데이터 모니터링 시스템

[![Open in Bolt.new](https://img.shields.io/badge/Open%20in-Bolt.new-00D9FF?style=for-the-badge&logo=stackblitz)](https://bolt.new)

## 🚀 빠른 시작 (Bolt.new)

**Bolt.new에서 바로 실행하기**: 이 프로젝트는 Bolt.new(StackBlitz)에서 브라우저만으로 바로 실행할 수 있습니다!

1. [Bolt.new](https://bolt.new) 접속
2. GitHub 저장소 URL 붙여넣기
3. 환경 변수 설정 (Firebase, Google Maps, OpenWeather API 키)
4. 즉시 실행!

**자세한 Bolt.new 설정 방법**: [`BOLT_SETUP.md`](./BOLT_SETUP.md) 참조

## 개요

Physics Dashboard는 전 세계의 다양한 물리학 데이터(지진, 날씨, 방사능 등)를 실시간으로 수집하고, Google Maps 상에 시각화하며, Firebase Firestore에 저장하는 웹 애플리케이션입니다.

## 주요 기능

### 1. Google Maps 통합
- **실시간 마커 표시**: 지진, 날씨, 방사능 데이터를 색상별 마커로 지도에 표시
- **히트맵 시각화**: 지진 활동을 히트맵으로 시각화
- **인터랙티브 정보창**: 마커 클릭 시 상세 정보 표시

### 2. Firebase 데이터베이스
- **Firestore 컬렉션**:
  - `earthquakes`: 지진 데이터 (USGS API)
  - `weather`: 날씨 데이터 (OpenWeather API)
  - `radiation`: 방사능 측정 데이터
  - `sync_logs`: 데이터 동기화 로그

### 3. 데이터 소스
- **지진**: USGS Earthquake API (실시간)
- **날씨**: OpenWeather API (주요 도시)
- **방사능**: 시뮬레이션 데이터 (실제 API 연동 가능)

### 4. 자동/수동 동기화
- **브라우저 자동 동기화**: 대시보드에서 "자동 동기화" 체크박스 활성화 시 24시간마다 자동 실행
- **수동 동기화**: 데이터 관리 페이지에서 즉시 동기화 가능
- **API 테스트**: 각 데이터 소스별 API 테스트 기능
- **동기화 로그**: 모든 동기화 작업 이력 저장 및 확인

### 5. 데이터베이스 설명서
- 각 데이터베이스의 스키마 문서
- API 접속 방법 안내
- 코드 예제 제공

## 기술 스택

- **Frontend**: React 18, TypeScript, Vite
- **Maps**: Google Maps JavaScript API
- **Database**: Firebase Firestore
- **External APIs**:
  - USGS Earthquake API
  - OpenWeather API
- **Styling**: Inline CSS (간단한 UI)

## 설치 및 설정

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일을 프로젝트 루트에 생성하고 다음 값들을 설정하세요:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Google Maps API Key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# External APIs
VITE_USGS_EARTHQUAKE_API=https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson
VITE_OPENWEATHER_API_KEY=your_openweather_api_key
VITE_OPENWEATHER_API_URL=https://api.openweathermap.org/data/2.5/weather
```

### 3. Firebase 프로젝트 설정

1. [Firebase Console](https://console.firebase.google.com/)에서 새 프로젝트 생성
2. Firestore Database 활성화 (테스트 모드로 시작)
3. 웹 앱 추가 후 구성 정보를 `.env`에 입력

### 4. Google Maps API 키 발급

1. [Google Cloud Console](https://console.cloud.google.com/)에서 프로젝트 생성
2. Maps JavaScript API 활성화
3. API 키 생성 후 `.env`에 입력
4. API 키에 다음 제한 사항 설정:
   - Maps JavaScript API
   - Places API (선택)
   - Maps Visualization API

### 5. OpenWeather API 키 발급

1. [OpenWeather](https://openweathermap.org/api) 계정 생성
2. API 키 발급 (무료 플랜 사용 가능)
3. `.env`에 입력

## 실행 방법

### 개발 모드

```bash
npm run dev
```

애플리케이션이 `http://localhost:3000`에서 실행됩니다.

### 프로덕션 빌드

```bash
npm run build
```

빌드된 파일은 `dist` 폴더에 생성됩니다.

### 프로덕션 미리보기

```bash
npm run preview
```

## 데이터 동기화 스케줄링

### 매일 1회 자동 동기화 설정 (Linux/Mac)

Cron job을 사용하여 매일 자동으로 데이터를 동기화할 수 있습니다:

```bash
# crontab 편집
crontab -e

# 매일 오전 2시에 동기화 실행
0 2 * * * cd /path/to/physics_dashboard && npm run sync >> /var/log/physics-sync.log 2>&1
```

### Windows Task Scheduler

1. 작업 스케줄러 실행
2. "기본 작업 만들기" 선택
3. 매일 실행하도록 설정
4. 작업: `npm run sync` 스크립트 실행

### 수동 동기화

```bash
npm run sync
```

## 프로젝트 구조

```
physics_dashboard/
├── src/
│   ├── components/          # React 컴포넌트
│   │   ├── GoogleMap.tsx   # Google Maps 컴포넌트
│   │   └── HeatMap.tsx     # 히트맵 컴포넌트
│   ├── pages/              # 페이지 컴포넌트
│   │   ├── Dashboard.tsx   # 메인 대시보드
│   │   ├── DataManagement.tsx  # 데이터 관리
│   │   └── Documentation.tsx   # DB 설명서
│   ├── services/           # 서비스 레이어
│   │   ├── firebaseService.ts  # Firebase 연동
│   │   ├── earthquakeAPI.ts    # 지진 API
│   │   ├── weatherAPI.ts       # 날씨 API
│   │   ├── radiationAPI.ts     # 방사능 API
│   │   └── syncService.ts      # 동기화 서비스
│   ├── config/             # 설정 파일
│   │   └── firebase.ts     # Firebase 설정
│   ├── types/              # TypeScript 타입
│   │   └── index.ts
│   ├── App.tsx             # 메인 앱 컴포넌트
│   ├── main.tsx            # 엔트리 포인트
│   └── index.css           # 글로벌 스타일
├── scripts/
│   └── sync-data.js        # 데이터 동기화 스크립트
├── .env                    # 환경 변수
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 사용 방법

### 1. 대시보드
- 실시간 데이터를 Google Maps 상에서 확인
- 필터 버튼으로 데이터 타입별 필터링
- 히트맵 뷰로 지진 활동 밀도 확인
- "데이터 동기화" 버튼으로 즉시 최신 데이터 가져오기

### 2. 데이터 관리
- API 테스트: 각 데이터 소스의 API 응답 확인
- 수동 동기화: 선택한 데이터를 즉시 Firebase에 저장
- 동기화 로그: 과거 동기화 이력 확인

### 3. DB 설명서
- 시스템 개요 확인
- 각 데이터베이스의 스키마 및 필드 설명
- API 접속 방법 및 코드 예제
- Firebase 직접 접속 방법

## API 사용 예제

### 지진 데이터 가져오기

```typescript
import { earthquakeAPI } from './services/earthquakeAPI';
import { firebaseService } from './services/firebaseService';

// API에서 직접 가져오기
const earthquakes = await earthquakeAPI.fetchRecentEarthquakes();

// Firebase에서 가져오기
const storedEarthquakes = await firebaseService.getEarthquakes(100);

// 특정 규모 이상 필터링
const majorEarthquakes = await earthquakeAPI.fetchEarthquakesByMagnitude(5.0);
```

### 날씨 데이터 가져오기

```typescript
import { weatherAPI } from './services/weatherAPI';

// 주요 도시 날씨
const weatherData = await weatherAPI.fetchWeatherForMajorCities();

// 특정 좌표의 날씨
const seoulWeather = await weatherAPI.fetchWeatherByCoordinates(37.5665, 126.9780);
```

### 데이터 동기화

```typescript
import { syncService } from './services/syncService';

// 모든 데이터 동기화
await syncService.syncAllData();

// 개별 동기화
await syncService.syncEarthquakeData();
await syncService.syncWeatherData();
await syncService.syncRadiationData();
```

## Firebase Firestore 규칙

Firestore 보안 규칙 예제 (개발 단계):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 읽기는 모두 허용, 쓰기는 인증된 사용자만
    match /{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

프로덕션 환경에서는 더 엄격한 규칙 적용을 권장합니다.

## 문제 해결

### Google Maps가 표시되지 않는 경우
- `.env` 파일의 `VITE_GOOGLE_MAPS_API_KEY` 확인
- Google Cloud Console에서 Maps JavaScript API 활성화 확인
- API 키 제한 사항 확인

### Firebase 연결 오류
- `.env` 파일의 Firebase 설정 확인
- Firebase Console에서 Firestore 활성화 확인
- 보안 규칙 확인

### API 데이터를 가져오지 못하는 경우
- OpenWeather API 키 확인
- API 요청 제한 확인 (무료 플랜 제한)
- 네트워크 연결 확인

## 라이선스

MIT License

## 기여

이슈나 풀 리퀘스트는 언제든지 환영합니다!

## 문의

문제가 발생하거나 질문이 있으시면 이슈를 등록해 주세요.
