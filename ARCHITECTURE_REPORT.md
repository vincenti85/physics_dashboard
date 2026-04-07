# Physics Dashboard — 시스템 아키텍처 보고서

> **분석 기준일:** 2026-04-07
> **브랜치:** fix/pr5-bugs (`b34a593`)
> **배포:** https://physics-dashboard.vercel.app

---

## 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [기술 스택](#2-기술-스택)
3. [디렉터리 구조](#3-디렉터리-구조)
4. [프론트엔드 아키텍처](#4-프론트엔드-아키텍처)
5. [백엔드 아키텍처](#5-백엔드-아키텍처)
6. [공유 라이브러리 (_lib)](#6-공유-라이브러리-_lib)
7. [데이터베이스 설계](#7-데이터베이스-설계)
8. [데이터 흐름](#8-데이터-흐름)
9. [외부 API 연동](#9-외부-api-연동)
10. [보안 아키텍처](#10-보안-아키텍처)
11. [배포 구성](#11-배포-구성)
12. [환경 변수](#12-환경-변수)
13. [빌드 및 컴파일](#13-빌드-및-컴파일)
14. [알려진 제한 사항](#14-알려진-제한-사항)

---

## 1. 프로젝트 개요

### 1.1 목적 및 사용자

Physics Dashboard는 **앨라배마 자연재해 실시간 물리 모니터링** 플랫폼이다. 전 세계 지진·기상·방사선 데이터를 외부 API에서 수집하여 Google Maps 위에 마커 및 히트맵으로 시각화한다.

| 항목 | 내용 |
|------|------|
| 목적 | 앨라배마 주 중심 자연재해 데이터 수집·시각화·모니터링 |
| 주요 사용자 | 재난 모니터링 담당자, 연구자, 일반 공개 대시보드 |
| 데이터 성격 | 공개 데이터 (USGS·OpenWeather) + 방사선 시뮬레이션 |
| 운영 모드 | Vercel Cron 자동 동기화 + 브라우저 수동/자동 동기화 |

### 1.2 아키텍처 전체 구조

```
┌──────────────────────────────────────────────────────────────────┐
│  외부 데이터 소스                                                   │
│  USGS Earthquake API  │  OpenWeather API  │  시뮬레이션 방사선    │
└──────────┬───────────────────┬──────────────────────┬────────────┘
           │ (서버사이드 fetch)  │                      │
           ▼                   ▼                      ▼
┌──────────────────────────────────────────────────────────────────┐
│  Vercel Serverless Functions (api/)                               │
│  /sync-earthquake  │  /sync-weather  │  /sync-radiation          │
│  /sync-all (병렬 오케스트레이션)     │  /health                   │
│  공통 로직: api/_lib/ (firebaseAdmin, syncEarthquake, ...)        │
└───────────────────────────┬──────────────────────────────────────┘
                            │ Firebase Admin SDK
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│  Firebase Firestore                                               │
│  earthquakes  │  weather  │  radiation  │  sync_logs            │
└───────────────────────────┬──────────────────────────────────────┘
                            │ Firebase Client SDK (읽기 전용)
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│  React Frontend (Vite SPA)                                        │
│  Dashboard  │  DataManagement  │  Documentation                  │
│  GoogleMap (마커)  │  HeatMap (히트맵)                           │
└──────────────────────────────────────────────────────────────────┘
```

---

## 2. 기술 스택

### 2.1 프론트엔드

| 기술 | 버전 | 역할 |
|------|------|------|
| React | 18.2.0 | UI 컴포넌트 프레임워크 |
| TypeScript | 5.3.3 | 정적 타입 (strict mode) |
| Vite | 5.0.8 | 번들러·개발 서버 |
| React Router | 6.20.1 | 클라이언트 사이드 라우팅 |
| Firebase JS SDK | 10.7.1 | Firestore 클라이언트 |
| @googlemaps/js-api-loader | 1.16.2 | Google Maps 동적 로드 |
| axios | 1.6.2 | HTTP 클라이언트 (서비스 레이어) |
| date-fns | 3.0.6 | 날짜 포맷·연산 |

### 2.2 백엔드 (서버리스)

| 기술 | 버전 | 역할 |
|------|------|------|
| Vercel Serverless Functions | - | API 엔드포인트 런타임 |
| firebase-admin | - | Firestore 서버사이드 쓰기 |
| @vercel/node | - | 핸들러 타입 정의 |

### 2.3 인프라·배포

| 구성요소 | 기술 | 비고 |
|----------|------|------|
| 프론트엔드 호스팅 | Vercel (CDN) | `dist/` 정적 배포 |
| 서버리스 함수 | Vercel Functions | `api/**/*.ts`, maxDuration 30초 |
| 데이터베이스 | Firebase Firestore | us-east1 (기본) |
| 스케줄러 | Vercel Cron | `vercel.json` 내 정의 |
| CI/CD | Vercel Git Integration | 브랜치 푸시 → 자동 배포 |

---

## 3. 디렉터리 구조

### 3.1 루트 레벨 구조

```
physics_dashboard/
├── api/                       # Vercel 서버리스 함수
│   ├── _lib/                  # 공유 라이브러리 (함수로 배포 안 됨)
│   │   ├── firebaseAdmin.ts   # Firebase Admin SDK 초기화 단일 소스
│   │   ├── syncEarthquake.ts  # 지진 동기화 핵심 로직
│   │   ├── syncWeather.ts     # 기상 동기화 핵심 로직
│   │   └── syncRadiation.ts   # 방사선 동기화 핵심 로직
│   ├── sync-earthquake.ts     # POST /api/sync-earthquake (얇은 래퍼)
│   ├── sync-weather.ts        # POST /api/sync-weather (얇은 래퍼)
│   ├── sync-radiation.ts      # POST /api/sync-radiation (얇은 래퍼)
│   ├── sync-all.ts            # POST /api/sync-all (병렬 오케스트레이션)
│   └── health.ts              # GET /api/health (헬스 체크)
├── src/                       # React SPA 소스
│   ├── components/            # 재사용 UI 컴포넌트
│   ├── pages/                 # 페이지 컴포넌트
│   ├── services/              # 외부 API·Firestore 서비스
│   ├── config/                # Firebase 클라이언트 설정
│   ├── types/                 # TypeScript 인터페이스
│   ├── App.tsx                # 라우터·내비게이션 루트
│   ├── main.tsx               # React 진입점
│   └── index.css              # 전역 스타일
├── index.html                 # HTML 진입점 (Vite SPA)
├── package.json               # 의존성·스크립트
├── vite.config.ts             # 빌드 설정·코드 스플리팅
├── tsconfig.json              # TypeScript 컴파일러 설정
├── vercel.json                # 배포·Cron·헤더 설정
├── firestore.rules            # Firestore 보안 규칙
├── .env.example               # 클라이언트 환경 변수 템플릿
└── .env.production.example    # 서버 환경 변수 템플릿
```

### 3.2 src/ 상세 구조

```
src/
├── components/
│   ├── GoogleMap.tsx     # Google Maps 마커 시각화 (149줄)
│   └── HeatMap.tsx       # 지진 히트맵 시각화 (96줄)
├── pages/
│   ├── Dashboard.tsx     # 메인 대시보드·자동/수동 동기화 (255줄)
│   ├── DataManagement.tsx # API 테스트·수동 동기화·싱크 로그 (216줄)
│   └── Documentation.tsx  # Firestore 스키마 문서 (461줄)
├── services/
│   ├── firebaseService.ts # Firestore CRUD (108줄)
│   ├── earthquakeAPI.ts   # USGS API 클라이언트 (50줄)
│   ├── weatherAPI.ts      # OpenWeather API 클라이언트 (71줄)
│   ├── radiationAPI.ts    # 방사선 시뮬레이션 생성 (53줄)
│   └── syncService.ts     # 전체 동기화 오케스트레이션 (126줄)
├── config/
│   └── firebase.ts        # Firebase 클라이언트 초기화 (42줄)
└── types/
    └── index.ts           # 공통 TypeScript 인터페이스 (52줄)
```

---

## 4. 프론트엔드 아키텍처

### 4.1 라우팅 구조

React Router v6 BrowserRouter 기반 SPA. 3개 라우트 모두 한글 UI.

```
<BrowserRouter>
  <App>
    <nav>  ← 공통 내비게이션 (3개 링크)
    <Routes>
      /              → <Dashboard />   ← 지도 + 데이터 시각화
      /data-management → <DataManagement /> ← API 테스트 + 싱크 로그
      /documentation   → <Documentation />  ← Firestore 스키마 문서
```

**SPA 라우팅 지원**: `vercel.json`의 `/(.*) → /index.html` 리라이트 규칙으로 브라우저 직접 URL 진입 지원.

### 4.2 컴포넌트 계층

```
App.tsx
└── <Routes>
    ├── Dashboard.tsx
    │   ├── GoogleMap.tsx (activeView !== 'heatmap')
    │   │   ├── google.maps.Map (TERRAIN 타입)
    │   │   └── google.maps.Marker[] (타입별 색상)
    │   │       └── google.maps.InfoWindow (sanitizeHtml 적용)
    │   └── HeatMap.tsx (activeView === 'heatmap')
    │       ├── google.maps.Map (SATELLITE 타입)
    │       └── google.maps.visualization.HeatmapLayer
    │           └── LatLng[] (magnitude² 가중치)
    │
    ├── DataManagement.tsx
    │   └── (내부 테이블·폼·결과 textarea)
    │
    └── Documentation.tsx
        └── (탭별 스키마 문서)
```

### 4.3 상태 관리

별도 상태 관리 라이브러리 없음. React 내장 훅 전용.

**Dashboard.tsx 핵심 상태:**

```typescript
const [earthquakes, setEarthquakes] = useState<EarthquakeData[]>([])
const [weather, setWeather]         = useState<WeatherData[]>([])
const [radiation, setRadiation]     = useState<RadiationData[]>([])
const [mapMarkers, setMapMarkers]   = useState<MapMarker[]>([])
const [activeView, setActiveView]   = useState<'all'|'earthquake'|'weather'|'radiation'|'heatmap'>('all')
const [loading, setLoading]         = useState(false)
const [syncing, setSyncing]         = useState(false)
const [autoSync, setAutoSync]       = useState(false)
const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
```

**useEffect 구성 (3개):**

| 이펙트 | 의존성 | 역할 |
|--------|--------|------|
| 초기 로드 | `[loadData]` | 컴포넌트 마운트 시 Firestore 데이터 fetch |
| 마커 업데이트 | `[updateMapMarkers]` | 데이터 변경 시 지도 마커 재생성 |
| 자동 동기화 타이머 | `[autoSync, handleSync]` | 24시간 setInterval (탭 열린 동안) |

**useCallback 훅**: `loadData`, `handleSync`, `updateMapMarkers` — 의존성 추적 리렌더링 방지.

### 4.4 지도 컴포넌트 상세

**GoogleMap.tsx:**
- `@googlemaps/js-api-loader`로 Google Maps JS API 동적 로드
- 기본 중심: 서울 (37.5665, 126.9780), 줌 레벨 3
- 마커 색상: 지진=빨간점, 기상=파란점, 방사선=노란점
- `sanitizeHtml()` 함수로 InfoWindow HTML 엔티티 인코딩 (XSS 방어)
- 리렌더 시 `marker.setMap(null)`으로 이전 마커 정리

**HeatMap.tsx:**
- `google.maps.visualization.HeatmapLayer` 사용
- 데이터 포인트 가중치: `magnitude * magnitude` (비선형 증폭)
- 불투명도 0.6, 반경 20px
- 14색 그라디언트 (cyan → blue → red)
- 위성 지도 타입 (SATELLITE)

### 4.5 서비스 레이어

싱글톤 패턴 — 각 서비스 파일이 인스턴스를 export.

| 서비스 | 클래스 | 주요 메서드 |
|--------|--------|------------|
| `firebaseService.ts` | `FirebaseService` | `getEarthquakes()`, `addEarthquake()`, `getWeatherData()`, `addWeatherData()`, `getRadiationData()`, `addRadiationData()`, `getSyncLogs()` |
| `earthquakeAPI.ts` | `EarthquakeAPI` | `fetchRecentEarthquakes()` |
| `weatherAPI.ts` | `WeatherAPI` | `fetchWeatherForMajorCities()` |
| `radiationAPI.ts` | `RadiationAPI` | `fetchRadiationData()` |
| `syncService.ts` | `SyncService` | `syncAllData()` (클라이언트 사이드 전체 동기화 오케스트레이션) |

---

## 5. 백엔드 아키텍처

### 5.1 서버리스 함수 구조

Vercel Functions — TypeScript, maxDuration 30초. `api/_lib/` (언더스코어 접두사)는 Vercel이 엔드포인트로 인식하지 않아 공유 모듈로만 사용됨.

**핸들러 패턴 (얇은 래퍼):**

```
api/sync-*.ts (HTTP 핸들러)
  ├─ 메서드 검증 (POST only)
  ├─ CRON_SECRET 인증 검증
  ├─ api/_lib/sync*.ts::run*Sync() 호출
  └─ HTTP 응답 반환
```

### 5.2 API 엔드포인트

| 메서드 | 경로 | Cron 스케줄 | 인증 | 역할 |
|--------|------|------------|------|------|
| `POST` | `/api/sync-earthquake` | `0 */6 * * *` (6시간마다) | Bearer CRON_SECRET | USGS 지진 동기화 |
| `POST` | `/api/sync-weather` | `0 */3 * * *` (3시간마다) | Bearer CRON_SECRET | 기상 동기화 |
| `POST` | `/api/sync-radiation` | `0 */6 * * *` (6시간마다) | Bearer CRON_SECRET | 방사선 동기화 |
| `POST` | `/api/sync-all` | `0 0 * * *` (매일 00:00 UTC) | Bearer CRON_SECRET | 3개 동기화 병렬 실행 |
| `GET` | `/api/health` | — | 없음 | 헬스 체크 |

**표준 응답 구조 (`SyncResult`):**

```typescript
interface SyncResult {
  success: boolean;
  recordsProcessed: number;
  recordsSaved: number;
  recordsFailed: number;
  errors?: string[];      // 부분 실패 시 최대 5건
  duration: number;       // 실행 시간 (ms)
  data?: unknown;         // 방사선: RadiationReading[]
}
```

### 5.3 sync-all 병렬 오케스트레이션

기존 HTTP 자기 호출(self-invocation) 방식 → 직접 함수 import 방식으로 리팩터링 (C-2 수정).

```typescript
// 3개 동기화를 병렬 실행, 개별 실패가 전체에 영향 없음
const [earthquakeResult, weatherResult, radiationResult] =
  await Promise.allSettled([
    runEarthquakeSync(),
    runWeatherSync(),
    runRadiationSync(),
  ]);
```

**이점:**
- HTTP 왕복 3회 제거 → 30초 maxDuration 내 안전 완료
- 개별 함수 실패가 다른 동기화에 영향 없음 (`allSettled`)
- sync-all의 Firestore sync_logs에 `dataType: 'all'` + 상세 결과 기록

### 5.4 오류 처리 전략

각 `run*Sync()` 함수는 2단계 오류 처리:

1. **레코드 단위 실패**: try-catch per item → `failedCount++` + `errors[]` 기록, 계속 진행
2. **치명적 실패** (API 전체 다운): catch → `sync_logs`에 `status: 'failed'` 기록 → `throw` 재전파 → HTTP 500 응답

---

## 6. 공유 라이브러리 (_lib)

### 6.1 firebaseAdmin.ts — 초기화 단일 소스

```typescript
// 모듈 레벨 초기화: warm instance 당 1회 실행
// apps.length 검사로 중복 초기화 방지
export const db: any = admin?.firestore();
export { admin };
export interface SyncResult { ... }
```

**설계 근거**: Vercel이 각 함수를 독립 번들로 컴파일하므로, `_lib`는 공유 코드지만 각 함수마다 별도 인스턴스로 번들됨. `apps.length` 검사가 warm instance 내 재초기화를 방지.

### 6.2 syncEarthquake.ts — 지진 동기화 로직

**주요 책임:**
- USGS GeoJSON API fetch
- null 필드 방어: `mag == null` 또는 `place == null` → skip + failedCount (C-3 수정)
- 좌표 배열 검증: `coordinates.length < 3` → skip
- `earthquakes` 컬렉션 저장 (`id` 필드 제외)
- `sync_logs` 기록 (성공·부분 성공·실패 모두)

### 6.3 syncWeather.ts — 기상 동기화 로직

**주요 책임:**
- 8개 도시 OpenWeather API 병렬 fetch (`Promise.all`)
- 도시별 fetch 실패 격리: `.catch(error => ({ error, city }))` 패턴
- `WeatherData.id` 제외 후 `weather` 컬렉션 저장
- 에러 경로 타입 구분: `'error' in result` 가드

### 6.4 syncRadiation.ts — 방사선 동기화 로직

**주요 책임:**
- 6개 지점 시뮬레이션 방사선 데이터 생성 (`generateRadiationReading()`)
- 기준값: Fukushima 0.5, Chernobyl 0.3, 기타 0.1 μSv/h + ±0.025 랜덤 변동
- `RadiationData.id` 제외 후 `radiation` 컬렉션 저장
- 응답에 `data: RadiationReading[]` 포함 (sync-all 집계용)

---

## 7. 데이터베이스 설계

### 7.1 컬렉션 스키마 개요

```
Firestore
├── earthquakes/          공개 읽기, 서버 전용 쓰기
├── weather/              공개 읽기, 서버 전용 쓰기
├── radiation/            공개 읽기, 서버 전용 쓰기
└── sync_logs/            클라이언트 접근 불가 (Admin SDK 전용)
```

### 7.2 earthquakes 컬렉션

**데이터 소스**: USGS Earthquake API (무료, 실시간)
**업데이트 주기**: 6시간마다 (Cron) + 수동
**예상 일일 레코드**: 100~500건

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| magnitude | number | ✓ | 리히터 규모 (null 이벤트 skip) |
| location | string | ✓ | 인간 가독 위치명 (null 이벤트 skip) |
| latitude | number | ✓ | 위도 (`coordinates[1]`) |
| longitude | number | ✓ | 경도 (`coordinates[0]`) |
| depth | number | ✓ | 진원 깊이 km (`coordinates[2]`) |
| timestamp | number | ✓ | 발생 시각 (Unix ms) |
| url | string | — | USGS 상세 페이지 URL |
| createdAt | Timestamp | ✓ | `serverTimestamp()` 자동 기록 |

### 7.3 weather 컬렉션

**데이터 소스**: OpenWeather API (무료 티어, API 키 필요)
**모니터링 도시**: 서울·도쿄·베이징·뉴욕·런던·파리·시드니·뭄바이 (8개)
**업데이트 주기**: 3시간마다 (Cron) + 수동

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| city | string | ✓ | 도시명 |
| latitude | number | ✓ | 위도 |
| longitude | number | ✓ | 경도 |
| temperature | number | ✓ | 섭씨 온도 (`main.temp`) |
| pressure | number | ✓ | 기압 hPa (`main.pressure`) |
| humidity | number | ✓ | 습도 0~100% (`main.humidity`) |
| windSpeed | number | ✓ | 풍속 m/s (`wind.speed`) |
| description | string | ✓ | 날씨 설명 (`weather[0].description`) |
| timestamp | number | ✓ | 측정 시각 (Unix ms) |
| createdAt | Timestamp | ✓ | `serverTimestamp()` 자동 기록 |

> **참고**: `WeatherData.id` 필드는 저장 전 spread 제거 (`const { id, ...weatherData } = result`).

### 7.4 radiation 컬렉션

**데이터 소스**: 시뮬레이션 (`source: 'Simulated Data'` 표기)
**모니터링 지점**: 후쿠시마·체르노빌·도쿄·서울·파리·뉴욕 (6개)
**업데이트 주기**: 6시간마다 (Cron) + 수동

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| location | string | ✓ | 측정 지점명 |
| latitude | number | ✓ | 위도 |
| longitude | number | ✓ | 경도 |
| value | number | ✓ | 방사선 수치 (μSv/h, 소수 3자리) |
| unit | string | ✓ | 단위 (`μSv/h`) |
| timestamp | number | ✓ | 측정 시각 (Unix ms) |
| source | string | ✓ | `'Simulated Data'` |
| createdAt | Timestamp | ✓ | `serverTimestamp()` 자동 기록 |

### 7.5 sync_logs 컬렉션

**목적**: 모든 동기화 작업의 감사 로그
**접근 제한**: 클라이언트 읽기·쓰기 모두 차단 (Admin SDK 전용)

| 필드 | 타입 | 설명 |
|------|------|------|
| dataType | string | `'earthquake'` \| `'weather'` \| `'radiation'` \| `'all'` |
| status | string | `'success'` \| `'partial_success'` \| `'failed'` |
| recordsCount | number | 저장 성공 레코드 수 |
| timestamp | number | 동기화 실행 시각 (Unix ms) |
| duration | number | 실행 소요 시간 (ms) |
| errorMessage | string? | 오류 메시지 (실패 시) |
| details | object? | `{ earthquake, weather, radiation }` (`dataType: 'all'` 시) |

### 7.6 Firestore 보안 규칙

**파일**: `firestore.rules`

```firestore-rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // 공개 대시보드: 읽기 허용, 쓰기 차단 (Admin SDK만 쓰기 가능)
    match /earthquakes/{document=**} { allow read: if true; allow write: if false; }
    match /weather/{document=**}     { allow read: if true; allow write: if false; }
    match /radiation/{document=**}   { allow read: if true; allow write: if false; }

    // 감사 로그: 클라이언트 접근 완전 차단
    match /sync_logs/{document=**}   { allow read, write: if false; }

    // 기본 정책: 모든 접근 차단
    match /{document=**}             { allow read, write: if false; }
  }
}
```

**설계 원칙**: 데이터 수집은 서버(Admin SDK), 조회는 클라이언트. 쓰기를 클라이언트에서 완전 차단하여 무단 데이터 변조 방지.

---

## 8. 데이터 흐름

### 8.1 Cron 자동 동기화 흐름

```
Vercel Cron 스케줄러 (vercel.json)
  └─ POST /api/sync-all  Authorization: Bearer CRON_SECRET
       └─ CRON_SECRET 검증
            └─ Promise.allSettled([
                   runEarthquakeSync()  → USGS API fetch
                        ↓ null 검증 + 변환
                        ↓ db.collection('earthquakes').add()
                        ↓ db.collection('sync_logs').add()
                   runWeatherSync()    → OpenWeather API × 8도시 병렬
                        ↓ 변환 (id 필드 제거)
                        ↓ db.collection('weather').add()
                        ↓ db.collection('sync_logs').add()
                   runRadiationSync()  → 시뮬레이션 생성
                        ↓ 변환 (id 필드 제거)
                        ↓ db.collection('radiation').add()
                        ↓ db.collection('sync_logs').add()
               ])
            └─ db.collection('sync_logs').add({ dataType: 'all', ... })
            └─ HTTP 200 응답 (집계 결과)
```

### 8.2 클라이언트 수동 동기화 흐름

```
사용자 "데이터 동기화" 버튼 클릭 (Dashboard.tsx)
  └─ syncService.syncAllData()
       ├─ earthquakeAPI.fetchRecentEarthquakes()  → USGS API (브라우저 fetch)
       │    └─ firebaseService.addEarthquake(data) → Firestore
       ├─ weatherAPI.fetchWeatherForMajorCities() → OpenWeather API (브라우저 fetch)
       │    └─ firebaseService.addWeatherData(data) → Firestore
       └─ radiationAPI.fetchRadiationData()       → 시뮬레이션 생성
            └─ firebaseService.addRadiationData(data) → Firestore
  └─ firebaseService.addSyncLog() → sync_logs
  └─ loadData() 호출 → 화면 갱신
```

> **주의**: 클라이언트 동기화는 브라우저 탭이 열려 있는 동안에만 작동. 프로덕션 24/7 수집은 Vercel Cron이 담당.

### 8.3 프론트엔드 데이터 표시 흐름

```
Dashboard.tsx 마운트
  └─ loadData()
       ├─ firebaseService.getEarthquakes(50)  → earthquakes 읽기 (최신 50건)
       ├─ firebaseService.getWeatherData(20)  → weather 읽기 (최신 20건)
       └─ firebaseService.getRadiationData(20) → radiation 읽기 (최신 20건)
  └─ setEarthquakes / setWeather / setRadiation 상태 갱신
  └─ updateMapMarkers()
       └─ 각 데이터 → MapMarker[] 변환
            └─ GoogleMap.tsx props로 전달
                 └─ google.maps.Marker 생성 (타입별 색상)
                      └─ InfoWindow (sanitizeHtml 적용 HTML)
```

---

## 9. 외부 API 연동

### 9.1 USGS Earthquake API

| 항목 | 내용 |
|------|------|
| URL | `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson` |
| 인증 | 없음 (공개 API) |
| 응답 형식 | GeoJSON (`FeatureCollection`) |
| 커버리지 | 전 세계, 모든 규모, 최근 24시간 |
| null 필드 | `mag`, `place`가 null일 수 있음 (검토 중 이벤트) — skip 처리 |
| 필드 매핑 | `feature.properties.mag` → `magnitude`, `feature.geometry.coordinates[1,0,2]` → `lat, lon, depth` |

### 9.2 OpenWeather API

| 항목 | 내용 |
|------|------|
| URL | `https://api.openweathermap.org/data/2.5/weather` |
| 인증 | API 키 필수 (`?appid=KEY`) |
| 무료 티어 한도 | 60 calls/min, 1M calls/day |
| 단위 | `units=metric` (섭씨) |
| 병렬 요청 | 8개 도시 `Promise.all` |
| 필드 매핑 | `main.temp/pressure/humidity`, `wind.speed`, `weather[0].description` |

### 9.3 방사선 데이터 (시뮬레이션)

| 항목 | 내용 |
|------|------|
| 소스 | `radiationAPI.ts` (클라이언트), `_lib/syncRadiation.ts` (서버) |
| 기준값 | 후쿠시마 0.5, 체르노빌 0.3, 그 외 0.1 μSv/h |
| 변동폭 | ±0.025 μSv/h 랜덤 지터 |
| 표시 | `source: 'Simulated Data'` 명시 |
| 향후 전환 | `radiationAPI.ts`를 실제 API (RadNet, IAEA)로 교체 가능 |

---

## 10. 보안 아키텍처

### 10.1 API 인증

모든 데이터 수집 엔드포인트(`/api/sync-*`)는 `Authorization: Bearer CRON_SECRET` 헤더 검증.

```typescript
if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
  return res.status(401).json({ error: 'Unauthorized' });
}
```

`CRON_SECRET`은 Vercel 환경 변수로 관리 (`openssl rand -base64 32` 생성 권장).

### 10.2 XSS 방어

`GoogleMap.tsx`의 `sanitizeHtml()` 함수:

```typescript
// & → &amp; 먼저 처리 (이중 인코딩 방지)
function sanitizeHtml(value: unknown): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}
```

모든 InfoWindow HTML 컨텐츠는 이 함수를 통과한 후 삽입.

### 10.3 Firestore 데이터 보호

| 접근 유형 | earthquakes / weather / radiation | sync_logs |
|----------|----------------------------------|-----------|
| 클라이언트 읽기 | `allow read: if true` (공개 대시보드) | `if false` |
| 클라이언트 쓰기 | `allow write: if false` | `if false` |
| Admin SDK 읽기 | 허용 (규칙 우회) | 허용 |
| Admin SDK 쓰기 | 허용 (규칙 우회) | 허용 |

### 10.4 비밀 정보 관리

| 비밀 | 저장 위치 | 접근 범위 |
|------|----------|----------|
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Vercel 환경 변수 | 서버 전용 |
| `OPENWEATHER_API_KEY` (서버) | Vercel 환경 변수 | 서버 전용 |
| `CRON_SECRET` | Vercel 환경 변수 | 서버 전용 |
| `VITE_FIREBASE_*` | Vercel 환경 변수 (빌드 시 번들 포함) | 브라우저 노출 (정상) |
| `VITE_GOOGLE_MAPS_API_KEY` | Vercel 환경 변수 (빌드 시 번들 포함) | 브라우저 노출 → Google Cloud Console 도메인 제한 권장 |
| `VITE_OPENWEATHER_API_KEY` | Vercel 환경 변수 (빌드 시 번들 포함) | 브라우저 노출 |

### 10.5 헬스 엔드포인트 보안

`GET /api/health` 공개 응답에서 환경 변수 이름 목록 제거 (I-3 수정):

```json
{
  "environment": {
    "allVariablesConfigured": true,
    "nodeEnv": "production",
    "vercelEnv": "production"
  }
}
```

---

## 11. 배포 구성

### 11.1 Vercel 설정 (vercel.json)

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "functions": { "api/**/*.ts": { "maxDuration": 30 } },
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    { "source": "/assets/(.*)", "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] },
    { "source": "/api/(.*)", "headers": [
      { "key": "Access-Control-Allow-Methods", "value": "GET, POST, OPTIONS" },
      { "key": "Access-Control-Allow-Headers", "value": "Content-Type, Authorization" }
    ]}
  ],
  "crons": [
    { "path": "/api/sync-all",        "schedule": "0 0 * * *"   },
    { "path": "/api/sync-earthquake", "schedule": "0 */6 * * *" },
    { "path": "/api/sync-weather",    "schedule": "0 */3 * * *" },
    { "path": "/api/sync-radiation",  "schedule": "0 */6 * * *" }
  ]
}
```

### 11.2 Cron 스케줄 상세

| 엔드포인트 | 스케줄 | 실행 횟수/일 | 목적 |
|-----------|--------|------------|------|
| /api/sync-all | 매일 00:00 UTC | 1회 | 전체 일일 베이스라인 동기화 |
| /api/sync-earthquake | 6시간마다 | 4회 | 빈번한 지진 업데이트 |
| /api/sync-weather | 3시간마다 | 8회 | 높은 빈도 기상 업데이트 |
| /api/sync-radiation | 6시간마다 | 4회 | 방사선 모니터링 |

### 11.3 캐시 전략

| 리소스 | Cache-Control | 설명 |
|--------|--------------|------|
| `/assets/*` | `public, max-age=31536000, immutable` | Vite 콘텐츠 해시 파일명 → 영구 캐시 |
| `/api/*` | 없음 | 실시간 데이터, 캐시 안 함 |
| `index.html` | 브라우저 기본 | SPA 진입점 |

### 11.4 코드 스플리팅 (Vite manualChunks)

```typescript
manualChunks: {
  'vendor':   ['react', 'react-dom', 'react-router-dom'],
  'firebase': ['firebase/app', 'firebase/firestore', 'firebase/auth'],
  'maps':     ['@googlemaps/js-api-loader']
}
```

---

## 12. 환경 변수

### 12.1 클라이언트 사이드 (VITE_ 접두사, 빌드 시 번들 포함)

| 변수 | 필수 | 설명 |
|------|------|------|
| `VITE_FIREBASE_API_KEY` | ✓ | Firebase 웹 앱 API 키 |
| `VITE_FIREBASE_AUTH_DOMAIN` | ✓ | Firebase Auth 도메인 |
| `VITE_FIREBASE_PROJECT_ID` | ✓ | Firebase 프로젝트 ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | ✓ | Storage 버킷 |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | ✓ | 메시징 발신자 ID |
| `VITE_FIREBASE_APP_ID` | ✓ | Firebase 앱 ID |
| `VITE_GOOGLE_MAPS_API_KEY` | ✓ | Google Maps JS API 키 |
| `VITE_OPENWEATHER_API_KEY` | ✓ | OpenWeather API 키 (클라이언트 수동 동기화용) |
| `VITE_OPENWEATHER_API_URL` | — | API URL (기본값 내장) |
| `VITE_USGS_EARTHQUAKE_API` | — | USGS URL (기본값 내장) |

### 12.2 서버 사이드 (Vercel 환경 변수, 빌드 번들 미포함)

| 변수 | 필수 | 설명 |
|------|------|------|
| `FIREBASE_SERVICE_ACCOUNT_KEY` | ✓ | Firebase Admin SDK 서비스 계정 JSON (stringify) |
| `FIREBASE_PROJECT_ID` | ✓ | Firebase 프로젝트 ID |
| `OPENWEATHER_API_KEY` | ✓ | OpenWeather API 키 (Cron 동기화용) |
| `CRON_SECRET` | ✓ | /api/sync-* 엔드포인트 Bearer 토큰 인증 |
| `VERCEL_URL` | 자동 | Vercel이 자동 설정 (현재 배포 URL) |
| `NODE_ENV` | 자동 | Vercel이 자동 설정 |
| `VERCEL_ENV` | 자동 | Vercel이 자동 설정 |

---

## 13. 빌드 및 컴파일

### 13.1 TypeScript 설정 요약

```jsonc
// tsconfig.json 핵심 옵션
{
  "target": "ES2020",
  "strict": true,           // 엄격 타입 체크
  "noUnusedLocals": true,   // 미사용 로컬 오류
  "noUnusedParameters": true, // 미사용 파라미터 오류
  "moduleResolution": "bundler",
  "noEmit": true            // Vite가 트랜스파일, tsc는 타입 체크만
}
```

### 13.2 빌드 스크립트

```bash
npm run dev      # Vite 개발 서버 (포트 3000)
npm run build    # tsc --noEmit (타입 체크) + vite build (번들)
npm run preview  # 빌드 결과물 로컬 미리보기
```

**빌드 출력**: `dist/` 디렉터리
- `index.html`
- `assets/vendor-[hash].js` (React 관련)
- `assets/firebase-[hash].js` (Firebase)
- `assets/maps-[hash].js` (Google Maps)
- `assets/index-[hash].js` (앱 코드)

---

## 14. 알려진 제한 사항

### 14.1 기술적 제한

| 제한 사항 | 영향 | 권장 해결 방법 |
|----------|------|--------------|
| 방사선 데이터 시뮬레이션 | 실제 모니터링 불가 | RadNet, IAEA API 연동 시 `radiationAPI.ts` 교체 |
| 클라이언트 자동 동기화 | 탭 닫히면 중단 | Vercel Cron이 서버 사이드 24/7 수집 담당 |
| Firestore 데이터 무한 누적 | 비용 증가 위험 | 월간 정리 Cron 잡 추가 검토 |
| 지진 데이터 최근 24시간만 | 과거 이력 없음 | USGS 기간별 API 엔드포인트 추가 고려 |
| Google Maps 키 브라우저 노출 | 외부 남용 가능 | Google Cloud Console 도메인 제한 필수 |
| Firestore 공개 읽기 | Firebase 비용 폭탄 위험 | Firebase App Check 도입 검토 |

### 14.2 미구현 기능

| 기능 | 우선순위 | 비고 |
|------|---------|------|
| 사용자 인증 | Medium | Firebase Auth 추가로 비공개 인스턴스 가능 |
| 규모 임계값 알림 | High | 지진 5.0 이상 시 Push/Email 알림 |
| 히스토리 데이터 차트 | Medium | 시계열 그래프 (date-fns 이미 설치됨) |
| 데이터 내보내기 | Low | CSV/JSON 다운로드 |
| 다크 모드 | Low | CSS 변수로 구현 가능 |
| 모바일 최적화 | Medium | 반응형 레이아웃 미구현 |

---

## 변경 이력

| 날짜 | 커밋 | 주요 변경 |
|------|------|---------|
| 2026-04-07 | `b34a593` | `api/_lib/` 공유 모듈 추출, sync-all HTTP 자기 호출 제거, USGS null 방어, health 엔드포인트 보안, sync-radiation Cron 추가 |
| 2026-04-07 | `256b532` | XSS 방어 (`sanitizeHtml`), Firestore 보안 규칙, CORS 정책 정비 |
| 2026-04-07 | `a501b11` | Vercel 서버리스 API 함수 추가, 배포 설정 업데이트 |

---

*생성: 2026-04-07 | 분석 기준: fix/pr5-bugs @ b34a593*
