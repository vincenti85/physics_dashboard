# Database Schema Documentation

## Firestore Collections

### 1. earthquakes

지진 데이터를 저장하는 컬렉션입니다.

**데이터 소스**: USGS Earthquake API
**업데이트 주기**: 매일 1회
**예상 문서 수**: 일일 100-500개

#### 스키마

| 필드명 | 타입 | 필수 | 설명 |
|-------|------|------|------|
| id | string | ✓ | USGS에서 제공하는 고유 식별자 (예: us6000jllz) |
| magnitude | number | ✓ | 지진 규모 (리히터 척도, 예: 5.8) |
| location | string | ✓ | 지진 발생 위치 설명 (예: "10km E of Tokyo, Japan") |
| latitude | number | ✓ | 위도 (-90 ~ 90) |
| longitude | number | ✓ | 경도 (-180 ~ 180) |
| depth | number | ✓ | 진원 깊이 (km, 예: 10.5) |
| timestamp | number | ✓ | 지진 발생 시간 (Unix timestamp in ms) |
| url | string | - | USGS 상세 정보 페이지 URL |
| createdAt | Timestamp | ✓ | Firestore 문서 생성 시간 |

#### 인덱스

- `timestamp` (DESC) - 최신 지진 조회용
- `magnitude` (DESC) - 큰 규모 지진 필터링용

#### 예제 문서

```json
{
  "id": "us6000jllz",
  "magnitude": 6.3,
  "location": "10km SE of Tokyo, Japan",
  "latitude": 35.6762,
  "longitude": 139.6503,
  "depth": 10.5,
  "timestamp": 1704067200000,
  "url": "https://earthquake.usgs.gov/earthquakes/eventpage/us6000jllz",
  "createdAt": "2025-01-01T00:00:00Z"
}
```

---

### 2. weather

날씨 데이터를 저장하는 컬렉션입니다.

**데이터 소스**: OpenWeather API
**업데이트 주기**: 매일 1회
**모니터링 도시**: 8개 주요 도시

#### 스키마

| 필드명 | 타입 | 필수 | 설명 |
|-------|------|------|------|
| id | string | ✓ | 고유 식별자 (city-timestamp 형식) |
| city | string | ✓ | 도시명 (예: Seoul, Tokyo) |
| latitude | number | ✓ | 위도 |
| longitude | number | ✓ | 경도 |
| temperature | number | ✓ | 온도 (섭씨, 예: 15.5) |
| pressure | number | ✓ | 기압 (hPa, 예: 1013) |
| humidity | number | ✓ | 습도 (%, 0-100) |
| windSpeed | number | ✓ | 풍속 (m/s, 예: 3.5) |
| description | string | ✓ | 날씨 설명 (예: "clear sky", "light rain") |
| timestamp | number | ✓ | 측정 시간 (Unix timestamp in ms) |
| createdAt | Timestamp | ✓ | Firestore 문서 생성 시간 |

#### 인덱스

- `timestamp` (DESC) - 최신 데이터 조회용
- `city`, `timestamp` (DESC) - 도시별 이력 조회용

#### 예제 문서

```json
{
  "id": "Seoul-1704067200000",
  "city": "Seoul",
  "latitude": 37.5665,
  "longitude": 126.9780,
  "temperature": 15.5,
  "pressure": 1013,
  "humidity": 65,
  "windSpeed": 3.5,
  "description": "clear sky",
  "timestamp": 1704067200000,
  "createdAt": "2025-01-01T00:00:00Z"
}
```

---

### 3. radiation

방사능 측정 데이터를 저장하는 컬렉션입니다.

**데이터 소스**: 시뮬레이션 (실제 API 연동 가능)
**업데이트 주기**: 매일 1회
**모니터링 지점**: 6개 주요 지점

#### 스키마

| 필드명 | 타입 | 필수 | 설명 |
|-------|------|------|------|
| id | string | ✓ | 고유 식별자 (rad-index-timestamp 형식) |
| location | string | ✓ | 측정 위치 설명 (예: "Fukushima, Japan") |
| latitude | number | ✓ | 위도 |
| longitude | number | ✓ | 경도 |
| value | number | ✓ | 방사능 수치 (예: 0.125) |
| unit | string | ✓ | 측정 단위 (기본값: "μSv/h") |
| timestamp | number | ✓ | 측정 시간 (Unix timestamp in ms) |
| source | string | ✓ | 데이터 출처 (예: "Monitoring Station", "Simulated Data") |
| createdAt | Timestamp | ✓ | Firestore 문서 생성 시간 |

#### 인덱스

- `timestamp` (DESC) - 최신 데이터 조회용
- `location`, `timestamp` (DESC) - 위치별 이력 조회용

#### 예제 문서

```json
{
  "id": "rad-0-1704067200000",
  "location": "Fukushima, Japan",
  "latitude": 37.4213,
  "longitude": 141.0327,
  "value": 0.125,
  "unit": "μSv/h",
  "timestamp": 1704067200000,
  "source": "Monitoring Station",
  "createdAt": "2025-01-01T00:00:00Z"
}
```

#### 참고: 방사능 수치 기준

- 일반 배경 방사선: 0.1 - 0.3 μSv/h
- 항공기 탑승 시: 약 2 - 3 μSv/h
- 의료 X-Ray: 약 100 μSv (1회)
- 연간 자연 방사선 피폭: 약 2,400 μSv

---

### 4. sync_logs

데이터 동기화 로그를 저장하는 컬렉션입니다.

**업데이트 주기**: 각 동기화 작업마다
**보관 기간**: 제한 없음 (필요 시 수동 삭제)

#### 스키마

| 필드명 | 타입 | 필수 | 설명 |
|-------|------|------|------|
| id | string | ✓ | 자동 생성 문서 ID |
| dataType | string | ✓ | 데이터 타입 ("earthquake", "weather", "radiation") |
| status | string | ✓ | 동기화 상태 ("success", "failed") |
| recordsCount | number | ✓ | 동기화된 레코드 수 |
| timestamp | number | ✓ | 동기화 실행 시간 (Unix timestamp in ms) |
| errorMessage | string | - | 오류 메시지 (실패 시에만) |
| createdAt | Timestamp | ✓ | Firestore 문서 생성 시간 |

#### 인덱스

- `timestamp` (DESC) - 최신 로그 조회용
- `dataType`, `timestamp` (DESC) - 데이터 타입별 이력 조회용
- `status`, `timestamp` (DESC) - 실패 로그 조회용

#### 예제 문서 (성공)

```json
{
  "id": "auto-generated-id",
  "dataType": "earthquake",
  "status": "success",
  "recordsCount": 245,
  "timestamp": 1704067200000,
  "createdAt": "2025-01-01T00:00:00Z"
}
```

#### 예제 문서 (실패)

```json
{
  "id": "auto-generated-id",
  "dataType": "weather",
  "status": "failed",
  "recordsCount": 0,
  "timestamp": 1704067200000,
  "errorMessage": "API rate limit exceeded",
  "createdAt": "2025-01-01T00:00:00Z"
}
```

---

## Firestore 보안 규칙

### 개발 환경

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### 프로덕션 환경

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 모든 읽기 허용
    match /{document=**} {
      allow read: if true;
    }

    // 각 컬렉션별 쓰기 권한 (인증된 사용자만)
    match /earthquakes/{earthquake} {
      allow create, update: if request.auth != null;
      allow delete: if false; // 삭제 불가
    }

    match /weather/{weather} {
      allow create, update: if request.auth != null;
      allow delete: if false;
    }

    match /radiation/{radiation} {
      allow create, update: if request.auth != null;
      allow delete: if false;
    }

    match /sync_logs/{log} {
      allow create: if request.auth != null;
      allow update, delete: if false; // 로그는 수정/삭제 불가
    }
  }
}
```

---

## 데이터 접근 패턴

### 1. 최신 데이터 조회

```typescript
// 최근 100개 지진 데이터
const earthquakes = await firebaseService.getEarthquakes(100);

// 최근 20개 날씨 데이터
const weather = await firebaseService.getWeatherData(20);
```

### 2. 특정 조건으로 필터링

```typescript
// 규모 5.0 이상 지진
const majorEarthquakes = await earthquakeAPI.fetchEarthquakesByMagnitude(5.0);

// 특정 지역의 지진
const regionalEarthquakes = await earthquakeAPI.fetchEarthquakesByRegion(
  30, 40,  // 위도 범위
  130, 145 // 경도 범위
);
```

### 3. 동기화 로그 조회

```typescript
// 최근 24시간 지진 동기화 로그
const recentLogs = await firebaseService.getRecentSyncLogs('earthquake', 24);

// 전체 동기화 로그 (최근 50개)
const allLogs = await firebaseService.getSyncLogs(50);
```

---

## 데이터 크기 및 비용 예측

### Firestore 사용량 (월간)

- **earthquakes**: ~15,000 문서 (일 500개 × 30일)
- **weather**: ~240 문서 (일 8개 × 30일)
- **radiation**: ~180 문서 (일 6개 × 30일)
- **sync_logs**: ~90 문서 (일 3개 × 30일)

**총 문서 수**: ~15,510 문서/월

### 예상 비용 (Firebase 무료 플랜 기준)

- 무료 할당량: 50,000 문서 읽기, 20,000 문서 쓰기/일
- 현재 사용량: 쓰기 ~520/일, 읽기는 앱 사용량에 따라 변동
- **비용**: 무료 플랜 내에서 충분히 사용 가능

---

## 데이터 마이그레이션 및 백업

### 백업 스크립트 예제

```javascript
// scripts/backup-firestore.js
import admin from 'firebase-admin';
import fs from 'fs';

const backup = async () => {
  const collections = ['earthquakes', 'weather', 'radiation', 'sync_logs'];

  for (const collectionName of collections) {
    const snapshot = await admin.firestore().collection(collectionName).get();
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    fs.writeFileSync(
      `backups/${collectionName}-${Date.now()}.json`,
      JSON.stringify(data, null, 2)
    );
  }
};

backup();
```

### 복원 스크립트 예제

```javascript
// scripts/restore-firestore.js
import admin from 'firebase-admin';
import fs from 'fs';

const restore = async (filename, collectionName) => {
  const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
  const batch = admin.firestore().batch();

  data.forEach(doc => {
    const ref = admin.firestore().collection(collectionName).doc(doc.id);
    batch.set(ref, doc);
  });

  await batch.commit();
};

restore('backups/earthquakes-xxx.json', 'earthquakes');
```

---

## 향후 확장 계획

### 추가 가능한 컬렉션

1. **users** - 사용자 인증 및 프로필
2. **alerts** - 사용자 알림 설정
3. **favorites** - 사용자가 즐겨찾기한 위치
4. **historical_data** - 과거 데이터 아카이브

### 데이터 파티셔닝

대용량 데이터 처리를 위해 월별/연도별 서브컬렉션 사용:

```
earthquakes/
  2025/
    01/
      {earthquake-docs}
    02/
      {earthquake-docs}
```

---

이 문서는 Physics Dashboard의 데이터베이스 구조를 설명합니다.
추가 질문이나 수정 사항은 이슈로 등록해 주세요.
