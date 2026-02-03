# Vercel 배포 완벽 가이드

이 문서는 Physics Dashboard 프로젝트를 Vercel에 배포하는 전체 과정을 안내합니다.

---

## 📋 배포 전 체크리스트

배포 전에 다음 항목들이 준비되어 있는지 확인하세요:

- ✅ GitHub 저장소에 프로젝트 코드가 푸시되어 있음
- ✅ Firebase 프로젝트가 생성되어 있음 (6개 환경 변수)
- ✅ Google Maps API 키가 발급되어 있음 (1개 환경 변수)
- ✅ OpenWeather API 키가 발급되어 있음 (1개 환경 변수)
- ✅ 모든 API 키가 활성화 상태

> **API 키가 없다면?** `SETUP.md` 파일을 참조하여 먼저 API 키를 발급받으세요.

---

## 🚀 1단계: Vercel 계정 연동 및 프로젝트 가져오기

### 1.1 Vercel 로그인

1. **[Vercel](https://vercel.com)** 접속
2. **"Sign Up"** 또는 **"Log In"** 클릭
3. **GitHub 계정으로 로그인** 권장 (자동 연동)
4. Vercel이 GitHub 저장소에 접근할 수 있도록 권한 승인

### 1.2 새 프로젝트 가져오기

1. Vercel 대시보드에서 **"Add New..."** → **"Project"** 클릭
2. **"Import Git Repository"** 섹션에서 GitHub 저장소 찾기
3. `vincenti85/physics_dashboard` 저장소 선택
4. **"Import"** 클릭

### 1.3 프로젝트 설정

**Configure Project** 화면에서:

1. **Project Name**: `physics-dashboard` (또는 원하는 이름)
2. **Framework Preset**: `Vite` (자동 감지됨)
3. **Root Directory**: `./` (기본값)
4. **Build Command**: `npm run build` (자동 설정됨)
5. **Output Directory**: `dist` (자동 설정됨)
6. **Install Command**: `npm install` (자동 설정됨)

> ⚠️ **아직 "Deploy" 버튼을 누르지 마세요!** 환경 변수를 먼저 설정해야 합니다.

---

## 🔐 2단계: 환경 변수 설정

### 2.1 환경 변수 추가 방법

1. **"Environment Variables"** 섹션 찾기 (Configure Project 화면 하단)
2. 또는 배포 후: **프로젝트 설정** → **Settings** → **Environment Variables**

### 2.2 필수 환경 변수 입력 (총 10개)

다음 환경 변수를 **하나씩** 추가하세요:

#### Firebase 설정 (6개)

| Key | Value (예시) |
|-----|--------------|
| `VITE_FIREBASE_API_KEY` | `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `physics-dashboard-xxxxx.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `physics-dashboard-xxxxx` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `physics-dashboard-xxxxx.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `123456789012` |
| `VITE_FIREBASE_APP_ID` | `1:123456789012:web:abcdef1234567890` |

#### Google Maps API (1개)

| Key | Value (예시) |
|-----|--------------|
| `VITE_GOOGLE_MAPS_API_KEY` | `AIzaYyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` |

#### 외부 API (3개)

| Key | Value |
|-----|-------|
| `VITE_USGS_EARTHQUAKE_API` | `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson` |
| `VITE_OPENWEATHER_API_KEY` | `abc123def456ghi789jkl012mno345pq` |
| `VITE_OPENWEATHER_API_URL` | `https://api.openweathermap.org/data/2.5/weather` |

### 2.3 환경 변수 입력 방법

각 환경 변수마다:

1. **Name (KEY)**: 위 표의 Key 값 입력 (예: `VITE_FIREBASE_API_KEY`)
2. **Value**: 실제 API 키 값 붙여넣기
3. **Environment**:
   - ✅ **Production** (프로덕션)
   - ✅ **Preview** (프리뷰)
   - ✅ **Development** (개발)
   - → **모두 체크** 권장
4. **"Add"** 또는 **"Save"** 클릭
5. 나머지 9개 환경 변수도 동일하게 반복

---

## 🌍 3단계: Google Maps API 키 도메인 제한 설정

⚠️ **매우 중요**: Vercel 도메인을 Google Maps API 키에 추가해야 지도가 정상 작동합니다.

### 3.1 Vercel 배포 URL 확인

1. Vercel에서 프로젝트 첫 배포 완료 후
2. **"Visit"** 버튼 클릭하여 배포된 URL 확인
3. URL 형식 예시:
   - `https://physics-dashboard.vercel.app` (프로덕션)
   - `https://physics-dashboard-git-main-yourusername.vercel.app` (Git 브랜치)
   - `https://physics-dashboard-xxxxx.vercel.app` (프리뷰)

### 3.2 Google Cloud Console에서 API 키 제한 업데이트

1. **[Google Cloud Console](https://console.cloud.google.com/)** 접속
2. **API 및 서비스** → **사용자 인증 정보** 이동
3. 기존 **Google Maps API 키** 옆 **연필 아이콘 (✏️)** 클릭
4. **"애플리케이션 제한사항"** → **"HTTP 리퍼러(웹사이트)"** 확인
5. **"항목 추가"** 클릭하여 다음 도메인 추가:

```
# Vercel 프로덕션 도메인
https://physics-dashboard.vercel.app/*
https://*.vercel.app/*

# Vercel 프리뷰 도메인 (선택사항)
https://physics-dashboard-*.vercel.app/*

# 로컬 개발 환경 (유지)
http://localhost:3000/*
http://localhost:5173/*

# Bolt.new (기존 설정 유지)
https://bolt.new/*
https://*.bolt.new/*
https://*.stackblitz.io/*
```

6. **"저장"** 클릭
7. 변경사항 적용 대기: **약 5분**

### 3.3 커스텀 도메인 사용 시

Vercel에서 커스텀 도메인을 추가한 경우:

```
https://yourdomain.com/*
https://*.yourdomain.com/*
```

위 패턴도 HTTP 리퍼러에 추가하세요.

---

## 🔥 4단계: Firebase 보안 규칙 업데이트

### 4.1 Firestore 보안 규칙 설정

⚠️ **현재 "테스트 모드"는 임시 설정입니다.** 프로덕션 배포 전에 보안 규칙을 강화해야 합니다.

1. **[Firebase Console](https://console.firebase.google.com/)** 접속
2. 프로젝트 선택
3. **Firestore Database** → **규칙** 탭 클릭
4. 다음 보안 규칙으로 업데이트:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 읽기는 모두 허용 (공개 대시보드)
    match /{document=**} {
      allow read: if true;
    }

    // 쓰기는 인증된 사용자만 허용 (향후 관리자 전용으로 변경 권장)
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

5. **"게시"** 클릭

### 4.2 승인된 도메인 추가

1. Firebase Console → **Authentication** → **Settings** 탭
2. **"승인된 도메인"** 섹션 찾기
3. **"도메인 추가"** 클릭
4. Vercel 도메인 추가:
   ```
   physics-dashboard.vercel.app
   ```
5. 커스텀 도메인이 있다면 해당 도메인도 추가

---

## 🎯 5단계: 배포 실행

### 5.1 첫 배포

1. 모든 환경 변수가 입력되었는지 확인
2. **"Deploy"** 버튼 클릭
3. 배포 진행 상황 확인 (약 2-3분 소요)
4. 배포 로그에서 오류 확인

### 5.2 배포 성공 확인

배포가 완료되면:

1. **"Visit"** 버튼 클릭하여 배포된 사이트 접속
2. Google Maps가 정상적으로 로드되는지 확인
3. **"데이터 동기화"** 버튼 클릭하여 데이터 불러오기 테스트
4. 브라우저 개발자 도구(F12) 콘솔에서 오류 확인

---

## 🔄 6단계: 자동 배포 설정

Vercel은 기본적으로 Git 푸시 시 자동 배포를 지원합니다.

### 6.1 자동 배포 동작 방식

- **프로덕션 배포**: `main` 또는 `master` 브랜치에 푸시 시
- **프리뷰 배포**: 다른 브랜치(예: `develop`, `feature/xxx`)에 푸시 시
- **PR 배포**: Pull Request 생성 시 자동으로 프리뷰 배포

### 6.2 배포 브랜치 설정

1. Vercel 프로젝트 → **Settings** → **Git**
2. **"Production Branch"** 설정: `main` (기본값)
3. **"Deploy Hooks"** (선택사항): 외부 트리거로 배포 가능

### 6.3 배포 제외 브랜치

특정 브랜치에서 자동 배포를 비활성화하려면:

1. **Settings** → **Git** → **Ignored Build Step**
2. 커스텀 빌드 조건 설정 가능

---

## 📊 7단계: 배포 후 확인 사항

### 7.1 기능 테스트 체크리스트

| 기능 | 확인 방법 | 상태 |
|------|----------|------|
| Google Maps 로드 | 지도가 정상 표시되는지 확인 | ☐ |
| 지진 데이터 동기화 | "데이터 동기화" 버튼 클릭 후 마커 표시 확인 | ☐ |
| 날씨 데이터 표시 | 날씨 정보가 정상 표시되는지 확인 | ☐ |
| 히트맵 표시 | 지진 히트맵이 정상 작동하는지 확인 | ☐ |
| 라우팅 | Dashboard, Data Management, Documentation 페이지 이동 확인 | ☐ |
| 반응형 디자인 | 모바일/태블릿/데스크톱 화면 크기별 확인 | ☐ |

### 7.2 성능 최적화 확인

Vercel은 자동으로 다음 최적화를 적용합니다:

- ✅ **Edge CDN**: 전 세계 CDN을 통한 빠른 로딩
- ✅ **자동 압축**: Gzip/Brotli 압축
- ✅ **이미지 최적화**: Next.js Image 컴포넌트 사용 시
- ✅ **캐싱**: 정적 자산 자동 캐싱
- ✅ **HTTPS**: 자동 SSL 인증서

### 7.3 성능 점수 측정

배포 후 성능 측정:

1. **[PageSpeed Insights](https://pagespeed.web.dev/)** 접속
2. 배포된 Vercel URL 입력
3. 모바일/데스크톱 성능 점수 확인
4. 권장 사항 적용

---

## 🛠️ 8단계: 문제 해결 (Troubleshooting)

### 8.1 빌드 실패

#### 증상: "Build failed" 오류

**원인**:
- TypeScript 컴파일 오류
- 의존성 패키지 설치 실패
- 환경 변수 누락

**해결 방법**:
1. Vercel 배포 로그에서 정확한 오류 메시지 확인
2. 로컬에서 `npm run build` 실행하여 오류 재현
3. TypeScript 오류 수정 후 재배포

```bash
# 로컬 빌드 테스트
npm install
npm run build
```

### 8.2 Google Maps 로드 실패

#### 증상: "This page can't load Google Maps correctly"

**원인**:
- API 키 도메인 제한 설정 누락
- 환경 변수 `VITE_GOOGLE_MAPS_API_KEY` 미설정
- API 키 비활성화 상태

**해결 방법**:

1. **환경 변수 확인**:
   - Vercel 프로젝트 → **Settings** → **Environment Variables**
   - `VITE_GOOGLE_MAPS_API_KEY`가 올바르게 설정되어 있는지 확인

2. **Google Cloud Console 확인**:
   - API 키의 HTTP 리퍼러에 `https://*.vercel.app/*` 포함 확인
   - Maps JavaScript API가 활성화되어 있는지 확인

3. **재배포**:
   - 환경 변수 변경 후 **Deployments** → **...** → **Redeploy**

### 8.3 Firebase 연결 실패

#### 증상: "Firebase: Error (auth/invalid-api-key)"

**원인**:
- Firebase 환경 변수 오타
- Firebase 프로젝트 설정 오류
- Firestore 데이터베이스 미생성

**해결 방법**:

1. **환경 변수 재확인**:
   ```
   VITE_FIREBASE_API_KEY
   VITE_FIREBASE_AUTH_DOMAIN
   VITE_FIREBASE_PROJECT_ID
   VITE_FIREBASE_STORAGE_BUCKET
   VITE_FIREBASE_MESSAGING_SENDER_ID
   VITE_FIREBASE_APP_ID
   ```

2. **Firebase Console 확인**:
   - Firestore Database가 생성되어 있는지 확인
   - 보안 규칙이 올바르게 설정되어 있는지 확인

3. **브라우저 콘솔 확인**:
   - F12 → Console 탭에서 정확한 오류 메시지 확인

### 8.4 데이터 동기화 실패

#### 증상: "데이터 동기화 중 오류가 발생했습니다"

**원인**:
- OpenWeather API 키 미활성화
- CORS 오류
- Firestore 쓰기 권한 부족

**해결 방법**:

1. **OpenWeather API 키 확인**:
   - API 키 활성화 대기 (10분~2시간)
   - 브라우저에서 테스트:
     ```
     https://api.openweathermap.org/data/2.5/weather?lat=35&lon=139&appid=YOUR_API_KEY
     ```

2. **Firebase 보안 규칙 확인**:
   - 읽기/쓰기 권한이 올바르게 설정되어 있는지 확인

3. **브라우저 네트워크 탭 확인**:
   - F12 → Network 탭에서 실패한 요청 확인
   - 401 Unauthorized: API 키 문제
   - 403 Forbidden: Firebase 보안 규칙 문제

### 8.5 SPA 라우팅 오류

#### 증상: 직접 URL 접근 시 404 오류

**원인**:
- `vercel.json` 설정 오류
- SPA 라우팅 미설정

**해결 방법**:

1. **vercel.json 확인**:
   ```json
   {
     "rewrites": [
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```

2. **재배포**: 변경사항 커밋 후 자동 배포 대기

### 8.6 환경 변수 미적용

#### 증상: 환경 변수가 `undefined`로 표시됨

**원인**:
- 환경 변수 이름 오타 (`VITE_` 접두사 누락)
- 배포 후 환경 변수 추가 (재배포 필요)

**해결 방법**:

1. **환경 변수 이름 확인**:
   - 모든 환경 변수는 `VITE_`로 시작해야 함
   - 예: `GOOGLE_MAPS_API_KEY` ❌ → `VITE_GOOGLE_MAPS_API_KEY` ✅

2. **재배포**:
   - 환경 변수 추가/수정 후 반드시 재배포 필요
   - **Deployments** → 최신 배포 → **...** → **Redeploy**

---

## 🌐 9단계: 커스텀 도메인 설정 (선택사항)

### 9.1 도메인 연결

1. Vercel 프로젝트 → **Settings** → **Domains**
2. **"Add"** 버튼 클릭
3. 도메인 입력 (예: `physics-dashboard.com`)
4. DNS 레코드 설정 안내 확인

### 9.2 DNS 설정

도메인 등록 업체(GoDaddy, Namecheap 등)에서:

**A 레코드 추가**:
```
Type: A
Name: @
Value: 76.76.19.19
TTL: 3600
```

**CNAME 레코드 추가** (www 서브도메인):
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

### 9.3 SSL 인증서 자동 발급

- Vercel이 자동으로 Let's Encrypt SSL 인증서 발급
- 도메인 연결 후 약 5-10분 소요
- HTTPS 자동 리다이렉트 적용

---

## 📈 10단계: 모니터링 및 분석

### 10.1 Vercel Analytics (선택사항)

1. Vercel 프로젝트 → **Analytics** 탭
2. **"Enable Analytics"** 클릭 (무료 플랜 제한 있음)
3. 실시간 방문자, 페이지 뷰, 성능 지표 확인

### 10.2 Google Analytics 연동 (선택사항)

`index.html`에 Google Analytics 스크립트 추가:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### 10.3 Firebase 사용량 모니터링

1. Firebase Console → **Usage** 탭
2. Firestore 읽기/쓰기 작업 수 확인
3. 무료 할당량 초과 방지:
   - **Firestore**: 일일 읽기 50,000건, 쓰기 20,000건
   - **Bandwidth**: 월 10GB

---

## 🎉 배포 완료!

축하합니다! Physics Dashboard가 성공적으로 Vercel에 배포되었습니다.

### 최종 체크리스트

- ✅ Vercel 배포 성공
- ✅ Google Maps 정상 작동
- ✅ Firebase 데이터 동기화 성공
- ✅ 모든 페이지 라우팅 정상
- ✅ API 키 보안 설정 완료
- ✅ 성능 테스트 완료

### 다음 단계

1. **팀원과 공유**: Vercel 프로젝트 설정에서 팀원 초대
2. **모니터링 설정**: 오류 추적 도구 연동 (Sentry 등)
3. **CI/CD 파이프라인**: GitHub Actions로 자동 테스트 추가
4. **성능 최적화**: 코드 스플리팅, 레이지 로딩 적용

---

## 📚 참고 자료

- **Vercel 공식 문서**: https://vercel.com/docs
- **Vite 배포 가이드**: https://vitejs.dev/guide/static-deploy.html
- **Firebase 보안 규칙**: https://firebase.google.com/docs/firestore/security/get-started
- **Google Maps API 제한**: https://developers.google.com/maps/api-security-best-practices

---

## 💬 문제가 발생했나요?

1. 이 문서의 **문제 해결** 섹션 참조
2. Vercel 배포 로그 확인
3. 브라우저 개발자 도구(F12) 콘솔 확인
4. GitHub Issues에 질문 등록

**즐거운 배포 되세요!** 🚀
