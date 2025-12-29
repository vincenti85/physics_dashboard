# Physics Dashboard 설정 가이드

## 1. Firebase 프로젝트 설정

### 1.1 Firebase 프로젝트 생성

1. [Firebase Console](https://console.firebase.google.com/) 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름 입력 (예: physics-dashboard)
4. Google Analytics 설정 (선택사항)
5. 프로젝트 생성 완료

### 1.2 Firestore Database 설정

1. Firebase Console에서 "Firestore Database" 메뉴 선택
2. "데이터베이스 만들기" 클릭
3. **테스트 모드**로 시작 (개발 단계)
4. 위치 선택 (예: asia-northeast1 - 도쿄)
5. "사용 설정" 클릭

### 1.3 웹 앱 추가

1. 프로젝트 개요 페이지에서 "웹" 아이콘 클릭 (`</>`)
2. 앱 닉네임 입력 (예: Physics Dashboard Web)
3. Firebase Hosting 설정은 건너뛰기
4. "앱 등록" 클릭
5. **Firebase 구성 정보를 복사**하여 `.env` 파일에 입력:

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc...
```

## 2. Google Maps API 설정

### 2.1 Google Cloud 프로젝트 생성

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. 프로젝트 이름 입력

### 2.2 Maps JavaScript API 활성화

1. 좌측 메뉴에서 "API 및 서비스" > "라이브러리" 선택
2. "Maps JavaScript API" 검색
3. "사용 설정" 클릭
4. **추가로 활성화**:
   - Places API (선택)
   - Maps Visualization API (히트맵 사용 시)

### 2.3 API 키 생성

1. "사용자 인증 정보" 메뉴 선택
2. "+ 사용자 인증 정보 만들기" > "API 키" 선택
3. API 키가 생성됨
4. **API 키 제한 설정** (권장):
   - "키 제한" 클릭
   - "HTTP 리퍼러(웹사이트)" 선택
   - 허용할 도메인 입력 (예: `localhost:3000/*`, `yourdomain.com/*`)
   - "API 제한사항"에서 다음 선택:
     - Maps JavaScript API
     - Places API
     - Maps Visualization API
5. `.env` 파일에 API 키 입력:

```env
VITE_GOOGLE_MAPS_API_KEY=AIza...
```

## 3. OpenWeather API 설정

### 3.1 계정 생성

1. [OpenWeather](https://openweathermap.org/api) 접속
2. "Sign Up" 클릭하여 무료 계정 생성
3. 이메일 인증 완료

### 3.2 API 키 발급

1. 로그인 후 "API keys" 메뉴 선택
2. 기본 API 키 확인 또는 새 API 키 생성
3. `.env` 파일에 API 키 입력:

```env
VITE_OPENWEATHER_API_KEY=your_api_key_here
VITE_OPENWEATHER_API_URL=https://api.openweathermap.org/data/2.5/weather
```

**참고**: 새로 생성된 API 키는 활성화까지 최대 2시간이 걸릴 수 있습니다.

### 3.3 무료 플랜 제한사항

- 분당 60회 호출 제한
- 일일 1,000,000회 호출 제한
- 현재 날씨 데이터만 제공

## 4. USGS Earthquake API

USGS API는 별도 인증이 필요 없습니다.

```env
VITE_USGS_EARTHQUAKE_API=https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson
```

## 5. 매일 자동 동기화 설정

### 5.1 Linux/Mac (Cron)

```bash
# crontab 편집
crontab -e

# 다음 줄 추가 (매일 오전 2시 실행)
0 2 * * * cd /path/to/physics_dashboard && /usr/local/bin/node /path/to/physics_dashboard/scripts/sync-data.js >> /var/log/physics-sync.log 2>&1
```

### 5.2 Windows (Task Scheduler)

1. 작업 스케줄러 실행 (`taskschd.msc`)
2. "작업 만들기" 선택
3. **일반 탭**:
   - 이름: Physics Dashboard Sync
   - "사용자의 로그온 여부에 관계없이 실행" 선택
4. **트리거 탭**:
   - "새로 만들기" 클릭
   - "매일" 선택
   - 시작 시간 설정 (예: 02:00)
5. **동작 탭**:
   - "프로그램 시작" 선택
   - 프로그램: `C:\Program Files\nodejs\node.exe`
   - 인수: `C:\path\to\physics_dashboard\scripts\sync-data.js`
   - 시작 위치: `C:\path\to\physics_dashboard`
6. "확인" 클릭

### 5.3 Docker (선택사항)

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Cron 설정
RUN apk add --no-cache dcron
RUN echo "0 2 * * * cd /app && node scripts/sync-data.js" | crontab -

CMD ["crond", "-f"]
```

## 6. Firebase Firestore 보안 규칙

### 6.1 개발 환경 (테스트 모드)

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

### 6.2 프로덕션 환경 (권장)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 읽기는 모두 허용
    match /{document=**} {
      allow read: if true;
    }

    // 쓰기는 인증된 사용자만
    match /earthquakes/{earthquake} {
      allow write: if request.auth != null;
    }

    match /weather/{weather} {
      allow write: if request.auth != null;
    }

    match /radiation/{radiation} {
      allow write: if request.auth != null;
    }

    match /sync_logs/{log} {
      allow write: if request.auth != null;
    }
  }
}
```

Firebase Console > Firestore Database > 규칙 탭에서 위 규칙을 입력하고 "게시"를 클릭합니다.

## 7. 환경 변수 최종 확인

`.env` 파일이 다음과 같이 설정되어 있는지 확인:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Google Maps API Key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# External APIs
VITE_USGS_EARTHQUAKE_API=https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson
VITE_OPENWEATHER_API_KEY=your_openweather_api_key
VITE_OPENWEATHER_API_URL=https://api.openweathermap.org/data/2.5/weather
```

## 8. 애플리케이션 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 브라우저에서 http://localhost:3000 접속
```

## 9. 동작 확인

1. **대시보드**: 지도가 정상적으로 표시되는지 확인
2. **데이터 동기화**: "데이터 동기화" 버튼 클릭하여 데이터 수집 테스트
3. **API 테스트**: 데이터 관리 페이지에서 각 API 테스트
4. **Firebase 확인**: Firebase Console에서 Firestore 데이터 확인

## 10. 문제 해결

### Google Maps 로드 실패
- 브라우저 콘솔에서 오류 메시지 확인
- API 키가 올바른지 확인
- Google Cloud Console에서 Maps JavaScript API가 활성화되었는지 확인

### Firebase 연결 오류
- `.env` 파일의 모든 Firebase 설정값 확인
- Firebase Console에서 Firestore가 생성되었는지 확인
- 네트워크 방화벽 설정 확인

### API 호출 실패
- OpenWeather API 키가 활성화되었는지 확인 (최대 2시간 소요)
- API 호출 제한을 초과하지 않았는지 확인
- 브라우저 콘솔의 네트워크 탭에서 API 응답 확인

## 11. 추가 기능 확장

### 실제 방사능 API 연동
`src/services/radiationAPI.ts`를 수정하여 실제 방사능 측정 API와 연동할 수 있습니다.

### 추가 데이터 소스
새로운 데이터 소스를 추가하려면:
1. `src/types/index.ts`에 타입 정의
2. `src/services/`에 새 API 서비스 생성
3. `src/services/firebaseService.ts`에 Firestore 메서드 추가
4. `src/pages/Dashboard.tsx`에 시각화 추가

설정 완료!
