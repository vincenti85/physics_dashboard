# Bolt.new 설정 가이드

이 가이드는 Bolt.new에서 Physics Dashboard를 실행하기 위한 설정 방법을 설명합니다.

## 📌 Bolt.new란?

Bolt.new는 StackBlitz 기반의 브라우저 내 개발 환경으로, 별도의 설치 없이 웹 브라우저에서 바로 React 애플리케이션을 실행할 수 있습니다.

## 🚀 빠른 시작

### 1. 프로젝트 불러오기

Bolt.new에서 이 프로젝트를 불러오는 방법:

1. [Bolt.new](https://bolt.new) 접속
2. GitHub 저장소 URL 입력 또는 프로젝트 파일 업로드
3. 자동으로 의존성 설치 시작

### 2. 환경 변수 설정 (필수)

Bolt.new에서는 환경 변수를 UI를 통해 설정해야 합니다:

1. 왼쪽 사이드바에서 **"Settings"** 또는 **"Environment Variables"** 클릭
2. 다음 환경 변수를 추가:

```
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

VITE_USGS_EARTHQUAKE_API=https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson
VITE_OPENWEATHER_API_KEY=your_openweather_api_key_here
VITE_OPENWEATHER_API_URL=https://api.openweathermap.org/data/2.5/weather
```

3. **중요**: `.env` 파일은 Bolt.new에서 자동으로 인식되지 않을 수 있으므로, UI를 통해 직접 설정하는 것을 권장합니다.

### 3. API 키 발급

#### Firebase 설정
1. [Firebase Console](https://console.firebase.google.com/) 접속
2. 새 프로젝트 생성
3. **Firestore Database** 생성 (테스트 모드로 시작)
4. 웹 앱 추가 후 구성 정보를 환경 변수에 입력

#### Google Maps API 키
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성
3. **Maps JavaScript API** 활성화
4. **API 키 생성** 후 환경 변수에 입력
5. 키 제한사항 설정:
   - HTTP 리퍼러 제한: `bolt.new/*`, `stackblitz.io/*` 추가
   - API 제한: Maps JavaScript API, Places API, Visualization API 선택

#### OpenWeather API 키
1. [OpenWeather](https://openweathermap.org/api) 접속
2. 무료 계정 생성
3. API 키 발급 (활성화까지 최대 2시간 소요)
4. 환경 변수에 입력

### 4. 애플리케이션 실행

환경 변수 설정 후:

1. Bolt.new가 자동으로 `npm install` 실행
2. `npm run dev` 명령으로 개발 서버 시작
3. 미리보기 창에서 애플리케이션 확인

## ⚙️ Bolt.new 전용 기능

### 클라이언트 사이드 자동 동기화

서버 사이드 Cron job 대신 브라우저 내 타이머를 사용합니다:

1. **대시보드**에서 "자동 동기화 (24시간마다)" 체크박스 활성화
2. 브라우저가 열려있는 동안 24시간마다 자동으로 데이터 동기화
3. 수동 동기화는 언제든지 "데이터 동기화" 버튼 클릭

**주의**: 브라우저를 닫으면 자동 동기화가 중지됩니다.

### 데이터 관리

**데이터 관리** 페이지에서:
- **API 테스트**: 각 데이터 소스의 API 응답 확인
- **수동 동기화**: 선택한 데이터를 즉시 Firebase에 저장
- **동기화 로그**: 과거 동기화 이력 확인

## 🔧 문제 해결

### 1. 환경 변수가 인식되지 않는 경우

**해결 방법**:
- Bolt.new의 Settings에서 환경 변수를 다시 확인
- 서버를 재시작 (우측 상단의 새로고침 버튼)
- 브라우저 캐시 삭제 후 재접속

### 2. Google Maps가 표시되지 않는 경우

**가능한 원인**:
- API 키가 올바르지 않음
- API 키에 Bolt.new/StackBlitz 도메인이 허용되지 않음

**해결 방법**:
1. Google Cloud Console > API 및 서비스 > 사용자 인증 정보
2. API 키 클릭 > "애플리케이션 제한사항"
3. "HTTP 리퍼러" 선택
4. 다음 리퍼러 추가:
   - `https://bolt.new/*`
   - `https://*.bolt.new/*`
   - `https://*.stackblitz.io/*`
5. 저장 후 5분 정도 대기

### 3. Firebase 연결 오류

**확인 사항**:
- Firebase Console에서 Firestore가 생성되었는지 확인
- Firestore 규칙이 읽기/쓰기를 허용하는지 확인:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;  // 테스트 모드
    }
  }
}
```

- 환경 변수의 Firebase 설정값이 정확한지 확인

### 4. CORS 오류

일부 API가 CORS 오류를 발생시킬 수 있습니다.

**해결 방법**:
- USGS API와 OpenWeather API는 CORS를 지원하므로 문제없음
- 다른 API를 추가할 경우, CORS 프록시 사용 고려

### 5. 빌드 오류

**일반적인 해결 방법**:
```bash
# Bolt.new 터미널에서 실행
npm install
npm run dev
```

TypeScript 오류가 발생하면:
- `tsconfig.json`의 `strict` 설정 확인
- 타입 정의 파일 확인

## 📱 모바일 지원

Bolt.new는 데스크톱 브라우저에 최적화되어 있습니다. 모바일에서는:
- 미리보기 기능이 제한적일 수 있음
- 환경 변수 설정이 어려울 수 있음

모바일 테스트는 배포 후 진행하는 것을 권장합니다.

## 🌐 배포

Bolt.new에서 개발 후 실제 배포는 다음 플랫폼을 권장합니다:

### Vercel 배포
1. [Vercel](https://vercel.com) 계정 생성
2. GitHub 저장소 연결
3. 환경 변수 설정
4. 자동 배포

### Netlify 배포
1. [Netlify](https://netlify.com) 계정 생성
2. GitHub 저장소 연결
3. Build command: `npm run build`
4. Publish directory: `dist`
5. 환경 변수 설정

### Firebase Hosting
1. Firebase 프로젝트에서 Hosting 활성화
2. Firebase CLI 설치 (로컬 환경 필요)
3. `firebase deploy` 실행

## 💡 팁

### 성능 최적화
- **초기 로딩 시간 단축**: 필요한 데이터만 먼저 로드
- **지도 마커 제한**: 한 번에 표시할 마커 수 제한 (현재: 50개)
- **이미지 최적화**: 아이콘 크기 최소화

### 개발 효율성
- Bolt.new의 **Hot Reload** 기능으로 실시간 미리보기
- 브라우저 개발자 도구 활용
- Console 로그로 API 응답 확인

### 데이터 관리
- Firebase Console에서 주기적으로 데이터 확인
- 오래된 데이터는 수동으로 삭제
- 동기화 로그로 문제 진단

## 📚 추가 리소스

- [Bolt.new 공식 문서](https://bolt.new/docs)
- [Firebase 공식 문서](https://firebase.google.com/docs)
- [Google Maps API 문서](https://developers.google.com/maps/documentation/javascript)
- [React 공식 문서](https://react.dev)

## 🆘 지원

문제가 발생하거나 질문이 있으시면:
1. 브라우저 콘솔에서 오류 메시지 확인
2. 환경 변수 설정 재확인
3. GitHub Issues에 문의

---

**중요**: Bolt.new는 개발 및 프로토타이핑에 적합합니다. 프로덕션 환경에서는 별도의 서버 배포를 권장합니다.
